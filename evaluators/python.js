/**
 * Python Code Evaluator using Pyodide (WASM).
 */

let pyodideInstance = null;
let isLoadingPyodide = false;
let pyodideLoadPromise = null;

async function initPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadPromise) return pyodideLoadPromise;

  pyodideLoadPromise = new Promise(async (resolve, reject) => {
    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((res, rej) => {
          script.onload = res;
          script.onerror = () => rej(new Error('Failed to load Pyodide CDN script'));
        });
      }
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
      resolve(pyodideInstance);
    } catch (err) {
      reject(err);
    }
  });

  return pyodideLoadPromise;
}

export async function evaluatePython(code, tests = []) {
  if (!tests || tests.length === 0) {
    return { success: true, message: 'No exact test cases defined.', results: [] };
  }

  try {
    const pyodide = await initPyodide();
    const results = [];
    let allPassed = true;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Setup python execution wrapper
      const pyScript = `
import json
import sys

# User code
${code}

def __run_test(input_str):
    try:
        val = json.loads(input_str)
    except:
        val = input_str
    
    if 'solution' in globals() and callable(globals()['solution']):
        return solution(val)
    elif 'run' in globals() and callable(globals()['run']):
        return run(val)
    elif 'solve' in globals() and callable(globals()['solve']):
        return solve(val)
    else:
        raise Exception("No solution(input) or run(input) function found.")

__run_test(${JSON.stringify(test.input)})
`;

      try {
        const pyResult = await pyodide.runPythonAsync(pyScript);
        const actualStr = typeof pyResult === 'object' && pyResult !== null ? JSON.stringify(pyResult) : String(pyResult);
        const expectedTrim = String(test.expectedOutput).trim();
        const actualTrim = String(actualStr).trim();

        const passed = actualTrim === expectedTrim;
        if (!passed) allPassed = false;

        results.push({
          index: i + 1,
          input: test.input,
          expected: test.expectedOutput,
          actual: actualTrim,
          passed
        });
      } catch (err) {
        allPassed = false;
        results.push({
          index: i + 1,
          input: test.input,
          expected: test.expectedOutput,
          actual: 'Error: ' + err.message,
          passed: false
        });
      }
    }

    return { success: allPassed, results };
  } catch (err) {
    return {
      success: false,
      error: 'Pyodide initialization or runner error: ' + err.message,
      results: []
    };
  }
}
