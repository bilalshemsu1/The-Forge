/**
 * JavaScript Code Evaluator using Web Worker sandbox with 5s timeout killswitch.
 */

export async function evaluateJavaScript(code, tests = []) {
  if (!tests || tests.length === 0) {
    try {
      const fn = new Function('input', code);
      fn(null);
      return { success: true, message: 'JavaScript syntax clean.', results: [] };
    } catch (err) {
      return { success: false, error: 'JavaScript Execution Error: ' + err.message, results: [] };
    }
  }

  const workerCode = `
    self.onmessage = function(e) {
      const { code, tests } = e.data;
      const results = [];
      let allPassed = true;

      try {
        const userFn = new Function('input', code + '\\n\\nif (typeof solution === "function") return solution(input); if (typeof run === "function") return run(input); if (typeof solve === "function") return solve(input);');
        
        for (let i = 0; i < tests.length; i++) {
          const test = tests[i];
          let parsedInput = test.input;
          try { parsedInput = JSON.parse(test.input); } catch(_) {}
          
          let expected = test.expectedOutput;
          try { expected = JSON.parse(test.expectedOutput); } catch(_) {}

          let output;
          let passed = false;
          let error = null;

          try {
            output = userFn(parsedInput);
            const strOutput = typeof output === 'object' ? JSON.stringify(output) : String(output);
            const strExpected = typeof expected === 'object' ? JSON.stringify(expected) : String(expected);
            passed = strOutput === strExpected || String(output).trim() === String(test.expectedOutput).trim();
          } catch(err) {
            error = err.message || String(err);
            passed = false;
          }

          if (!passed) allPassed = false;
          results.push({
            index: i + 1,
            input: test.input,
            expected: test.expectedOutput,
            actual: error ? 'Error: ' + error : String(output),
            passed
          });
        }

        self.postMessage({ success: allPassed, results });
      } catch (err) {
        self.postMessage({ success: false, error: 'Execution Error: ' + err.message, results: [] });
      }
    };
  `;

  return new Promise((resolve) => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    let timeoutId;

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve({ success: false, error: 'Worker Error: ' + err.message, results: [] });
    };

    timeoutId = setTimeout(() => {
      worker.terminate();
      resolve({ success: false, error: 'Time Limit Exceeded: Code execution timed out (5s limit).', results: [] });
    }, 5000);

    worker.postMessage({ code, tests });
  });
}
