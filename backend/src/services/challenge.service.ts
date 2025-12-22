import vm from 'vm';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
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

export class ChallengeService {

    async executeSubmission(code: string, language: string, testCases: TestCase[]): Promise<{
        totalTests: number;
        testsPassed: number;
        results: ExecutionResult[];
    }> {
        if (language === 'python') {
            return this.executePython(code, testCases);
        }

        if (language === 'java') {
            return this.executeJava(code, testCases);
        }

        if (language !== 'javascript' && language !== 'typescript') {
            throw new Error(`Execution for language '${language}' is not supported.`);
        }

        const results: ExecutionResult[] = [];
        let testsPassed = 0;

        for (const test of testCases) {
            const result = await this.runTestCase(code, test);
            results.push(result);
            if (result.passed) {
                testsPassed++;
            }
        }

        return {
            totalTests: testCases.length,
            testsPassed,
            results
        };
    }

    private executeJava(userCode: string, testCases: TestCase[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const className = `DeepMindJavaRunner_${timestamp}`;
            const tempFile = path.join(os.tmpdir(), `${className}.java`);

            // Remove public from class Solution to avoid compilation errors
            const sanitizedUserCode = userCode.replace(/public\s+class/g, 'class');

            const generateTestLogic = () => {
                return testCases.map((tc, index) => {
                    // Handle input arguments
                    const inputArgs = Array.isArray(tc.input) ? tc.input : [tc.input];
                    const args = inputArgs.map(arg => this.formatJavaValue(arg)).join(', ');
                    const expected = this.formatJavaValue(tc.expectedOutput);
                    const comma = index > 0 ? 'System.out.println(",");' : '';

                    return `
                    ${comma}
                    try {
                        long startTime = System.nanoTime();
                        Object result = null;
                        
                        // Instantiate Solution
                        Solution sol = new Solution();

                        // Reflection to find method
                        for (java.lang.reflect.Method m : Solution.class.getDeclaredMethods()) {
                            if (m.getModifiers() == java.lang.reflect.Modifier.PUBLIC) {
                                // Invoke method
                                result = m.invoke(sol, ${args});
                                break;
                            }
                        }
                        
                        long endTime = System.nanoTime();
                        double execTime = (endTime - startTime) / 1000000.0;
                        
                        // Compare results
                        String resStr = result instanceof int[] ? java.util.Arrays.toString((int[])result) : String.valueOf(result);
                        String expStr = ${expected.startsWith('new int') ? 'java.util.Arrays.toString(' + expected + ')' : 'String.valueOf(' + expected + ')'};
                        
                        // For Arrays (Two Sum context), sort logic
                        if (result instanceof int[]) {
                             int[] resArr = ((int[])result).clone();
                             java.util.Arrays.sort(resArr);
                             resStr = java.util.Arrays.toString(resArr);
                             
                             int[] expArr = ${expected};
                             java.util.Arrays.sort(expArr);
                             expStr = java.util.Arrays.toString(expArr);
                        }

                        boolean passed = resStr.equals(expStr);
                        
                        System.out.print("{\\"passed\\": " + passed + ", \\"output\\": " + (result instanceof int[] ? java.util.Arrays.toString((int[])result) : result) + ", \\"executionTime\\": " + execTime + "}");
                    } catch (Exception e) {
                        System.out.print("{\\"passed\\": false, \\"error\\": \\"" + e.toString().replace("\\"", "\\\\\\\"") + "\\"}");
                    }
                    `;
                }).join('\n');
            };

            const javaRunner = `
import java.util.*;

public class ${className} {
    public static void main(String[] args) {
        System.out.print("[");
        ${generateTestLogic()}
        System.out.print("]");
    }
}

${sanitizedUserCode}
`;

            try {
                fs.writeFileSync(tempFile, javaRunner);
                // Execute using single-file source code mode (Java 11+)
                const stdout = execSync(`java ${tempFile}`, { timeout: 5000, encoding: 'utf-8' });

                let results = [];
                try {
                    results = JSON.parse(stdout.trim());
                } catch (parseError) {
                    console.error("Java JSON parse error. Stdout:", stdout);
                    throw new Error("Failed to parse Java output");
                }

                const totalTests = results.length;
                const testsPassed = results.filter((r: any) => r.passed).length;

                resolve({
                    totalTests,
                    testsPassed,
                    results
                });
            } catch (error: any) {
                logger.error("Java execution error", error);
                const errorMessage = error.stderr ? error.stderr.toString() : error.message;
                resolve({
                    totalTests: testCases.length,
                    testsPassed: 0,
                    results: testCases.map(() => ({ passed: false, error: "Runtime Error: " + errorMessage }))
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
            return `new int[]{${val.join(', ')}}`; // Assuming int array for Two Sum
        }
        if (typeof val === 'string') return `"${val}"`;
        return String(val);
    }

    private executePython(userCode: string, testCases: TestCase[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const tempFile = path.join(os.tmpdir(), `submission_${Date.now()}.py`);

            const pythonRunner = `
import sys
import json
import time

${userCode}

def run_tests():
    test_cases = ${JSON.stringify(testCases)}
    results = []
    
    # Find user function
    # heuristic: last function defined in globals that isn't this runner
    globs = globals()
    funcs = [f for name, f in globs.items() if callable(f) and f.__module__ == __name__ and name != 'run_tests']
    
    if not funcs:
        print(json.dumps([{"passed": False, "error": "No function found"}]))
        return

    target_func = funcs[-1]

    for tc in test_cases:
        try:
            inp = tc['input']
            expected = tc['expectedOutput']
            
            start_time = time.time()
            if isinstance(inp, list):
                res = target_func(*inp)
            else:
                res = target_func(inp)
            end_time = time.time()
            exec_time = (end_time - start_time) * 1000

            is_passed = False
            if isinstance(res, list) and isinstance(expected, list):
                 is_passed = sorted(res) == sorted(expected)
            else:
                 is_passed = res == expected
            
            results.append({
                "passed": is_passed,
                "output": res,
                "executionTime": exec_time
            })
        except Exception as e:
            results.append({
                "passed": False,
                "error": str(e)
            })
            
    print(json.dumps(results))

if __name__ == '__main__':
    run_tests()
`;

            try {
                fs.writeFileSync(tempFile, pythonRunner);
                const stdout = execSync(`python3 ${tempFile}`, { timeout: 2000, encoding: 'utf-8' });
                const results = JSON.parse(stdout.trim());

                // Calculate aggregated stats
                const totalTests = results.length;
                const testsPassed = results.filter((r: any) => r.passed).length;

                resolve({
                    totalTests,
                    testsPassed,
                    results
                });
            } catch (error: any) {
                // If python fails (syntax error, etc)
                // stdout/stderr might be in error
                logger.error("Python execution error", error);

                // If it's a timeout or runtime error caught by node execSync
                const errorMessage = error.stderr ? error.stderr.toString() : error.message;

                // Return a failure result for all tests or a generic error
                // We should probably structure this to match expected return type
                resolve({
                    totalTests: testCases.length,
                    testsPassed: 0,
                    results: testCases.map(() => ({ passed: false, error: "Runtime Error: " + errorMessage }))
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
            console: {
                log: (...args: any[]) => { },
            },
            input: testCase.input,
            result: undefined
        };

        const context = vm.createContext(sandbox);

        const wrapperCode = `
            ${userCode}

            try {
                // Heuristic: Find the user defined function
                const keys = Object.keys(this).filter(k => 
                    typeof this[k] === 'function' && 
                    k !== 'console' && 
                    k !== 'require'
                );

                const funcName = keys.length > 0 ? keys[keys.length - 1] : 'solution';
                const func = this[funcName];
                
                if (typeof func === 'function') {
                    // Check if input is an array of arguments (heuristic for multiple args)
                    // If the function expects multiple args and input is an array, spread it.
                    if (Array.isArray(input) && func.length > 1) {
                        result = func(...input);
                    } else {
                        result = func(input);
                    }
                } else {
                     // Try looking specifically for 'solution' or 'twoSum' if heuristics fail, or just throw
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
                // Sort for order-independent comparison (Two Sum req)
                const sortedRes = [...resultVal].sort();
                const sortedExp = [...expectedVal].sort();
                passed = JSON.stringify(sortedRes) === JSON.stringify(sortedExp);
            } else {
                passed = JSON.stringify(resultVal) === JSON.stringify(expectedVal);
            }

            return {
                passed,
                output: resultVal,
                executionTime
            };

        } catch (error: any) {
            return {
                passed: false,
                error: error.message
            };
        }
    }
}

export default new ChallengeService();
