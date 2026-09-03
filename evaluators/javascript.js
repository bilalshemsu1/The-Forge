/**
 * JavaScript Code Evaluator using Web Worker sandbox.
 */

export async function evaluateJavaScript(code, tests = []) {
  if (!tests || tests.length === 0) {
    return { success: true, message: 'No exact test cases defined.', results: [] };
  }

  const workerCode = `
    self.onmessage = function(e) {
      const { code, tests } = e.data;
      const results = [];
      let allPassed = true;

      try {
        // Execute user code to define functions/variables
        const userFn = new Function('input', code + '\\n\\nif (typeof solution === "function") return solution(input); if (typeof run === "function") return run(input);');
        
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

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        success: false,
        error: 'Execution timed out (5s limit exceeded). Possible infinite loop.',
        results: []
      });
    }, 5000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({
        success: false,
        error: 'Worker runtime error: ' + err.message,
        results: []
      });
    };

    worker.postMessage({ code, tests });
  });
}
