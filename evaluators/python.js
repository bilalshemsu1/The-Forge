/**
 * Python Code Evaluator using Pyodide (WASM).
 */

let pyodideInstance = null;
let pyodideLoadPromise = null;

export async function initPyodide() {
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
    // Basic syntax check using Pyodide if no test cases defined
    try {
      const pyodide = await initPyodide();
      pyodide.runPython(code);
      return { success: true, message: 'Python syntax clean.', results: [] };
    } catch (err) {
      return { success: false, error: 'Python Execution Error: ' + err.message, results: [] };
    }
  }

  try {
    const pyodide = await initPyodide();
    const results = [];
    let allPassed = true;

    pyodide.globals.set('__user_code', code);

    const pyHarness = `
import json
import sys
import re

exec(__user_code, globals())

def __exec_test(input_str, starter_code):
    try:
        val = json.loads(input_str)
    except Exception:
        val = input_str

    fn = None
    if 'solution' in globals():
        fn = globals()['solution']
    elif 'run' in globals():
        fn = globals()['run']
    elif 'solve' in globals():
        fn = globals()['solve']
    else:
        matches = re.findall(r'def\\s+([a-zA-Z0-9_]+)\\s*\\(', __user_code)
        for m in matches:
            if m not in ('__exec_test', '__run_test'):
                fn = globals().get(m)
                if fn:
                    break

    if fn is None:
        raise Exception("No candidate function found in python script.")

    res = None
    if isinstance(val, dict):
        try:
            res = fn(**val)
        except TypeError:
            res = fn(val)
    elif isinstance(val, list):
        try:
            res = fn(*val)
        except TypeError:
            res = fn(val)
    else:
        res = fn(val)

    if hasattr(res, 'to_py'):
        res = res.to_py()
    return json.dumps(res)
`;

    pyodide.runPython(pyHarness);
    const execTest = pyodide.globals.get('__exec_test');

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      let outputStr = '';
      let passed = false;
      let error = null;

      try {
        const rawJson = execTest(test.input, '');
        const actualObj = JSON.parse(rawJson);
        const expectedObj = JSON.parse(test.expectedOutput);

        const strActual = typeof actualObj === 'object' ? JSON.stringify(actualObj) : String(actualObj);
        const strExpected = typeof expectedObj === 'object' ? JSON.stringify(expectedObj) : String(expectedObj);

        passed = (strActual === strExpected) || (String(rawJson).trim() === String(test.expectedOutput).trim());
        outputStr = strActual;
      } catch (err) {
        error = err.message || String(err);
        passed = false;
      }

      if (!passed) allPassed = false;
      results.push({
        index: i + 1,
        input: test.input,
        expected: test.expectedOutput,
        actual: error ? 'Error: ' + error : outputStr,
        passed
      });
    }

    execTest.destroy();
    return { success: allPassed, results };
  } catch (err) {
    return { success: false, error: 'Python Execution Error: ' + err.message, results: [] };
  }
}
