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
        const getRunner = new Function(code + '\\n\\n' +
          'if (typeof solution === "function") return solution; ' +
          'if (typeof run === "function") return run; ' +
          'if (typeof solve === "function") return solve; ' +
          'const matches = [...code.matchAll(/(?:function|class|const|let|var)\\s+([a-zA-Z0-9_]+)/g)].map(m => m[1]); ' +
          'for (const m of matches) { ' +
          '  try { if (typeof eval(m) === "function") return eval(m); } catch(_) {} ' +
          '} ' +
          'return null;'
        );

        const targetFn = getRunner();
        if (!targetFn) {
          throw new Error("No runnable solution function found in submitted code.");
        }
        
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
            if (typeof parsedInput === 'object' && parsedInput !== null && !Array.isArray(parsedInput)) {
              try {
                output = targetFn(...Object.values(parsedInput));
              } catch (_) {
                output = targetFn(parsedInput);
              }
            } else if (Array.isArray(parsedInput)) {
              try {
                output = targetFn(...parsedInput);
              } catch (_) {
                output = targetFn(parsedInput);
              }
            } else {
              output = targetFn(parsedInput);
            }

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
            actual: error ? 'Error: ' + error : (typeof output === 'object' ? JSON.stringify(output) : String(output)),
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
