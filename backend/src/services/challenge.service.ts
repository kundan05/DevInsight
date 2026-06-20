import vm from 'vm';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { transformSync } from 'esbuild';
import { ChallengeRepository } from '../repositories/ChallengeRepository';
import { UserRepository } from '../repositories/UserRepository';
import logger from '../utils/logger';

export interface TestCase {
  input: any;
  expectedOutput: any;
}

export interface ExecutionResult {
  passed: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
}

export interface SubmissionResult {
  totalTests: number;
  testsPassed: number;
  results: ExecutionResult[];
}

export class ChallengeService {
  private challengeRepo: ChallengeRepository;

  constructor() {
    this.challengeRepo = new ChallengeRepository();
  }

  async getAll(filters: {
    difficulty?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.challengeRepo.findWithFilters(filters);
    return {
      ...result,
      data: this.challengeRepo.parseChallengesBulk(result.data),
    };
  }

  async getById(id: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) return null;
    return this.challengeRepo.parseChallenge(challenge);
  }

  async submit(id: string, userId: string, code: string, language: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new Error('Challenge not found');

    const parsed = this.challengeRepo.parseChallenge(challenge);
    const testCases: TestCase[] = parsed.testCases;

    const executionResult = await this.executeSubmission(code, language, testCases);

    const passed = executionResult.testsPassed === executionResult.totalTests;
    const status = passed
      ? 'ACCEPTED'
      : executionResult.testsPassed > 0
        ? 'WRONG_ANSWER'
        : 'WRONG_ANSWER';
    const score = passed ? challenge.points : 0;

    const maxExecTime = executionResult.results.reduce(
      (max, r) => Math.max(max, r.executionTime || 0), 0
    );

    const submission = await this.challengeRepo.createSubmission({
      challengeId: id,
      userId,
      code,
      language,
      status,
      executionTime: Math.floor(maxExecTime),
      memoryUsed: 0,
      testsPassed: executionResult.testsPassed,
      totalTests: executionResult.totalTests,
      score,
      feedback: executionResult.results as any,
    });

    return {
      submission: {
        ...submission,
        feedback: submission.feedback ?? null,
      },
      passed,
    };
  }

  async run(id: string, code: string, language: string) {
    const challenge = await this.challengeRepo.findById(id);
    if (!challenge) throw new Error('Challenge not found');

    const parsed = this.challengeRepo.parseChallenge(challenge);
    const testCases: TestCase[] = parsed.testCases;

    return this.executeSubmission(code, language, testCases);
  }

  async getLeaderboard(limit = 10) {
    const userRepo = new UserRepository();
    return userRepo.getLeaderboard(limit);
  }

  async getUserSubmissions(userId: string) {
    return this.challengeRepo.getUserSubmissions(userId);
  }

  async executeSubmission(code: string, language: string, testCases: TestCase[]): Promise<SubmissionResult> {
    if (language === 'python') {
      return this.executePython(code, testCases);
    }

    if (language === 'java') {
      return this.executeJava(code, testCases);
    }

    if (language !== 'javascript' && language !== 'typescript') {
      throw new Error(`Execution for language '${language}' is not supported.`);
    }

    let execCode = code;
    if (language === 'typescript') {
      try {
        const result = transformSync(code, { loader: 'ts', target: 'es2020' });
        execCode = result.code;
      } catch {
        throw new Error('Failed to transpile TypeScript. Check your syntax.');
      }
    }

    const results: ExecutionResult[] = [];
    let testsPassed = 0;

    for (const test of testCases) {
      const result = await this.runTestCase(execCode, test);
      results.push(result);
      if (result.passed) {
        testsPassed++;
      }
    }

    return {
      totalTests: testCases.length,
      testsPassed,
      results,
    };
  }

  private executeJava(userCode: string, testCases: TestCase[]): Promise<any> {
    return new Promise((resolve) => {
      const timestamp = Date.now();
      const className = `DeepMindJavaRunner_${timestamp}`;
      const tempFile = path.join(os.tmpdir(), `${className}.java`);

      const sanitizedUserCode = userCode.replace(/public\s+class/g, 'class');
      const importRegex = /^\s*import\s+.*;/gm;
      const userImports = userCode.match(importRegex) || [];
      const codeWithoutImports = sanitizedUserCode.replace(importRegex, '').trim();

      const methodMatch = codeWithoutImports.match(/public\s+(?:static\s+)?(?:[\w<>[\]]+\s+)+(\w+)\s*\(([^)]*)\)/);
      let paramCount = 0;
      if (methodMatch) {
        const params = methodMatch[2].trim();
        paramCount = params === '' ? 0 : params.split(',').length;
      }

      const classMatch = codeWithoutImports.match(/class\s+(\w+)/);
      const userClassName = classMatch ? classMatch[1] : 'Solution';

      const generateTestLogic = () => {
        return testCases.map((tc, index) => {
          let inputArgs;
          if (paramCount === 1 && Array.isArray(tc.input)) {
            inputArgs = [tc.input];
          } else {
            inputArgs = Array.isArray(tc.input) ? tc.input : [tc.input];
          }

          const args = inputArgs.map((arg: any) => this.formatJavaValue(arg)).join(', ');
          const expected = this.formatJavaValue(tc.expectedOutput);
          const comma = index > 0 ? 'originalOut.println(",");' : '';
          const isExpectedArray = Array.isArray(tc.expectedOutput);

          return `
                    ${comma}
                    try {
                        long startTime = System.nanoTime();
                        Object result = null;
                        Object sol = new ${userClassName}();
                        for (java.lang.reflect.Method m : ${userClassName}.class.getDeclaredMethods()) {
                            if (m.getModifiers() == java.lang.reflect.Modifier.PUBLIC) {
                                result = m.invoke(sol, ${args});
                                break;
                            }
                        }
                        long endTime = System.nanoTime();
                        double execTime = (endTime - startTime) / 1000000.0;
                        String resStr = result instanceof int[] ? java.util.Arrays.toString((int[])result) : String.valueOf(result);
                        String expStr = ${isExpectedArray ? 'java.util.Arrays.toString(' + expected + ')' : 'String.valueOf(' + expected + ')'};
                        if (result instanceof int[]) {
                             int[] resArr = ((int[])result).clone();
                             java.util.Arrays.sort(resArr);
                             resStr = java.util.Arrays.toString(resArr);
                             ${isExpectedArray ? `
                             int[] expArr = ${expected};
                             java.util.Arrays.sort(expArr);
                             expStr = java.util.Arrays.toString(expArr);
                             ` : ''}
                        } else if (result instanceof java.util.List) {
                             resStr = result.toString();
                        }
                        boolean passed = resStr.equals(expStr);
                        String outputVal = (result instanceof int[] ? java.util.Arrays.toString((int[])result) : String.valueOf(result));
                        String escapedOutput = outputVal.replace("\\"", "\\\\\\"").replace("\\\\", "\\\\\\\\").replace("\\n", "\\\\n").replace("\\r", "\\\\r").replace("\\t", "\\\\t");
                        originalOut.print("{\\"passed\\": " + passed + ", \\"output\\": \\"" + escapedOutput + "\\", \\"executionTime\\": " + execTime + "}");
                    } catch (Exception e) {
                        String escapedError = e.toString().replace("\\"", "\\\\\\"").replace("\\\\", "\\\\\\\\").replace("\\n", "\\\\n").replace("\\r", "\\\\r");
                        originalOut.print("{\\"passed\\": false, \\"error\\": \\"" + escapedError + "\\"}");
                    }
                    `;
        }).join('\n');
      };

      const javaRunner = `
import java.util.*;
${userImports.join('\n')}

public class ${className} {
    public static void main(String[] args) {
        java.io.PrintStream originalOut = System.out;
        System.setOut(System.err);
        originalOut.print("[");
        ${generateTestLogic()}
        originalOut.print("]");
    }
}

${codeWithoutImports}
`;

      try {
        fs.writeFileSync(tempFile, javaRunner);
        const stdout = execFileSync('java', ['--enable-preview', '--source', '21', tempFile], { timeout: 5000, encoding: 'utf-8' });

        let results = [];
        try {
          results = JSON.parse(stdout.trim());
        } catch (parseError) {
          logger.error('Java JSON parse error', parseError);
          throw new Error('Failed to parse Java output');
        }

        const totalTests = results.length;
        const testsPassed = results.filter((r: any) => r.passed).length;

        resolve({ totalTests, testsPassed, results });
      } catch (error: any) {
        logger.error('Java execution error', error);
        const errorMessage = error.stderr ? error.stderr.toString() : error.message;
        let userFriendlyError = 'Runtime Error: ' + errorMessage;
        if (errorMessage.includes('reached end of file')) {
          userFriendlyError = 'Compilation Error: Missing closing brace. Check syntax.';
        }

        resolve({
          totalTests: testCases.length,
          testsPassed: 0,
          results: testCases.map(() => ({ passed: false, error: userFriendlyError })),
        });
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  }

  private formatJavaValue(val: any): string {
    if (Array.isArray(val)) {
      return `new int[]{${val.join(', ')}}`;
    }
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  private executePython(userCode: string, testCases: TestCase[]): Promise<any> {
    return new Promise((resolve) => {
      const tempFile = path.join(os.tmpdir(), `submission_${Date.now()}.py`);

      const pythonRunner = `
import sys
import json
import time

_orig_stdout = sys.stdout
sys.stdout = sys.stderr

${userCode}

def run_tests():
    test_cases = ${JSON.stringify(testCases)}
    results = []
    globs = globals()
    targets = [obj for name, obj in globs.items() 
               if callable(obj) 
               and getattr(obj, '__module__', None) == __name__ 
               and name != 'run_tests'
               and name != '_orig_stdout']
    if not targets:
        print(json.dumps([{"passed": False, "error": "No function or class found"}]), file=_orig_stdout)
        return
    target = targets[-1]
    is_class = isinstance(target, type)
    if is_class:
        try:
            instance = target()
            methods = [getattr(instance, m) for m in dir(instance) 
                       if callable(getattr(instance, m)) and not m.startswith('__')]
            if not methods:
                print(json.dumps([{"passed": False, "error": "Class found but no public method"}]), file=_orig_stdout)
                return
            target_func = methods[-1]
        except Exception as e:
             print(json.dumps([{"passed": False, "error": f"Failed to instantiate class: {str(e)}"}]), file=_orig_stdout)
             return
    else:
        target_func = target
    for tc in test_cases:
        try:
            inp = tc['input']
            expected = tc['expectedOutput']
            start_time = time.time()
            if isinstance(inp, list):
                try:
                   res = target_func(*inp)
                except TypeError:
                   res = target_func(inp)
            else:
                res = target_func(inp)
            end_time = time.time()
            exec_time = (end_time - start_time) * 1000
            is_passed = False
            if isinstance(res, tuple): res = list(res)
            if isinstance(res, list) and isinstance(expected, list):
                 try:
                    res_sorted = sorted([sorted(x) if isinstance(x, (list, tuple)) else x for x in res], key=lambda x: str(x))
                    exp_sorted = sorted([sorted(x) if isinstance(x, (list, tuple)) else x for x in expected], key=lambda x: str(x))
                    is_passed = res_sorted == exp_sorted
                 except:
                    is_passed = res == expected
            else:
                 is_passed = res == expected
            results.append({"passed": is_passed, "output": str(res), "executionTime": exec_time})
        except Exception as e:
            results.append({"passed": False, "error": str(e)})
    print(json.dumps(results), file=_orig_stdout)

if __name__ == '__main__':
    run_tests()
`;

      try {
        fs.writeFileSync(tempFile, pythonRunner);
        const stdout = execFileSync('python3', [tempFile], { timeout: 2000, encoding: 'utf-8' });
        const results = JSON.parse(stdout.trim());
        const totalTests = results.length;
        const testsPassed = results.filter((r: any) => r.passed).length;
        resolve({ totalTests, testsPassed, results });
      } catch (error: any) {
        logger.error('Python execution error', error);
        const errorMessage = error.stderr ? error.stderr.toString() : error.message;
        resolve({
          totalTests: testCases.length,
          testsPassed: 0,
          results: testCases.map(() => ({ passed: false, error: 'Runtime Error: ' + errorMessage })),
        });
      } finally {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  }

  private async runTestCase(userCode: string, testCase: TestCase): Promise<ExecutionResult> {
    const sandbox: any = {
      console: { log: (...args: any[]) => {} },
      input: testCase.input,
      result: undefined,
    };

    const context = vm.createContext(sandbox);

    const wrapperCode = `
            ${userCode}
            try {
                const keys = Object.keys(this).filter(k => 
                    typeof this[k] === 'function' && 
                    k !== 'console' && 
                    k !== 'require'
                );
                const funcName = keys.length > 0 ? keys[keys.length - 1] : 'solution';
                const func = this[funcName];
                if (typeof func === 'function') {
                    if (Array.isArray(input) && func.length > 1) {
                        result = func(...input);
                    } else {
                        result = func(input);
                    }
                } else {
                     if (typeof solution === 'function') {
                        result = solution(input);
                     } else {
                        throw new Error("No function found. Please define a function.");
                     }
                }
            } catch (e) {
                throw e;
            }
        `;

    const start = process.hrtime();

    try {
      const script = new vm.Script(wrapperCode);
      script.runInContext(context, { timeout: 1000 });

      const end = process.hrtime(start);
      const executionTime = (end[0] * 1000 + end[1] / 1e6);

      let passed = false;
      const resultVal = sandbox.result;
      const expectedVal = testCase.expectedOutput;

      if (Array.isArray(resultVal) && Array.isArray(expectedVal)) {
        const sortedRes = [...resultVal].sort();
        const sortedExp = [...expectedVal].sort();
        passed = JSON.stringify(sortedRes) === JSON.stringify(sortedExp);
      } else {
        passed = JSON.stringify(resultVal) === JSON.stringify(expectedVal);
      }

      return { passed, output: resultVal, executionTime };
    } catch (error: any) {
      return { passed: false, error: error.message };
    }
  }
}
