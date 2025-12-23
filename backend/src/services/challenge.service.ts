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

            // Extract imports from user code
            const importRegex = /^\s*import\s+.*;/gm;
            const userImports = userCode.match(importRegex) || [];
            const codeWithoutImports = sanitizedUserCode.replace(importRegex, '').trim();

            // Detect method signature to determine parameter count
            // Looks for: public [static] Type methodName(params)
            const methodMatch = codeWithoutImports.match(/public\s+(?:static\s+)?(?:[\w<>[\]]+\s+)+(\w+)\s*\(([^)]*)\)/);
            let paramCount = 0;
            if (methodMatch) {
                const params = methodMatch[2].trim();
                // Naive split by comma, works for simple types
                paramCount = params === '' ? 0 : params.split(',').length;
            }

            const generateTestLogic = () => {
                return testCases.map((tc, index) => {
                    // Handle input arguments
                    // If paramCount is 1 and input is an array, pass it as a single argument (e.g. 3Sum)
                    // Otherwise treat array input as multiple arguments (e.g. Two Sum)
                    let inputArgs;
                    if (paramCount === 1 && Array.isArray(tc.input)) {
                        inputArgs = [tc.input];
                    } else {
                        inputArgs = Array.isArray(tc.input) ? tc.input : [tc.input];
                    }

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
                        } else if (result instanceof java.util.List) {
                             // Handle List<List<Integer>> for 3Sum
                             // toString typically works: [[-1, -1, 2], [-1, 0, 1]]
                             // But order might differ. Simple string compare for now since we rely on sorted validation on frontend or exact output match
                             // Ideally we deep sort, but that's complex in generated Java.
                             // Let's trust standard toString for Lists for basic matching.
                             resStr = result.toString();
                             // Need to handle expected which is likely formatted as String or new int[]
                             // If expected is array of arrays in JSON... formatJavaValue handles flat arrays only?
                             // tc.expectedOutput for 3Sum is [[...], [...]]
                             // formatJavaValue needs update for nested arrays?
                        }

                        boolean passed = resStr.equals(expStr);
                        
                        // Fix output formatting for Lists
                        String outputVal = (result instanceof int[] ? java.util.Arrays.toString((int[])result) : String.valueOf(result));
                         
                        System.out.print("{\\"passed\\": " + passed + ", \\"output\\": \\"" + outputVal.replace("\\"", "\\\\\\\"") + "\\", \\"executionTime\\": " + execTime + "}");
                    } catch (Exception e) {
                        System.out.print("{\\"passed\\": false, \\"error\\": \\"" + e.toString().replace("\\"", "\\\\\\\"") + "\\"}");
                    }
                    `;
                }).join('\n');
            };

            const javaRunner = `
import java.util.*;
${userImports.join('\n')}

public class ${className} {
    public static void main(String[] args) {
        System.out.print("[");
        ${generateTestLogic()}
        System.out.print("]");
    }
}

${codeWithoutImports}
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

                // Log the generated Java code for debugging
                logger.error("Generated Java Code that failed compilation:\n" + javaRunner);

                const errorMessage = error.stderr ? error.stderr.toString() : error.message;

                let userFriendlyError = "Runtime Error: " + errorMessage;
                if (errorMessage.includes("reached end of file")) {
                    userFriendlyError = "Compilation Error: It seems you are missing a closing brace '}'. Please check your syntax.";
                } else if (errorMessage.includes("class, interface, or enum expected")) {
                    userFriendlyError = "Compilation Error: Please ensure you are not using 'package' declarations and imports are valid.";
                }

                resolve({
                    totalTests: testCases.length,
                    testsPassed: 0,
                    results: testCases.map(() => ({ passed: false, error: userFriendlyError }))
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
    
    # Find user function or class
    globs = globals()
    # Filter for user-defined callables (functions or classes)
    # Exclude imported modules/functions (like Counter) by checking __module__
    targets = [obj for name, obj in globs.items() 
               if callable(obj) 
               and obj.__module__ == __name__ 
               and name != 'run_tests']
    
    if not targets:
        print(json.dumps([{"passed": False, "error": "No function or class found"}]))
        return

    # Heuristic: Use the last defined target
    target = targets[-1]
    
    # If target is a class (like Solution), instantiate it and find the method
    is_class = isinstance(target, type)
    if is_class:
        try:
            instance = target()
            # Find the method in the instance (excluding magic methods)
            methods = [getattr(instance, m) for m in dir(instance) 
                       if callable(getattr(instance, m)) and not m.startswith('__')]
            if not methods:
                print(json.dumps([{"passed": False, "error": "Class found but no public method defined"}]))
                return
            # Use the last defined method? Or first? usually there's only one main method in Solution
            # Let's assume the last one similar to global heuristic
            target_func = methods[-1]
        except Exception as e:
             print(json.dumps([{"passed": False, "error": f"Failed to instantiate class: {str(e)}"}]))
             return
    else:
        target_func = target

    for tc in test_cases:
        try:
            inp = tc['input']
            expected = tc['expectedOutput']
            
            start_time = time.time()
            if isinstance(inp, list):
                # If input is list, it might be multiple args or single arg that is a list
                # For TwoSum/ThreeSum it's typically one arg (list of ints)
                # But our java runner treats list as multiple args.
                # Let's try to be smart: inspect target_func signature? 
                # OR (simpler): try *inp, if TypeError, try inp
                try:
                   res = target_func(*inp)
                except TypeError:
                   res = target_func(inp)
            else:
                res = target_func(inp)
            end_time = time.time()
            exec_time = (end_time - start_time) * 1000

            is_passed = False
            # Normalize for comparison (tuples to lists, sorted order for arrays)
            if isinstance(res, tuple): res = list(res)
            
            if isinstance(res, list) and isinstance(expected, list):
                 # Deep sort for order independence (e.g. [[-1,0,1], [-1,-1,2]])
                 try:
                    res_sorted = sorted([sorted(x) if isinstance(x, (list, tuple)) else x for x in res], key=lambda x: str(x))
                    exp_sorted = sorted([sorted(x) if isinstance(x, (list, tuple)) else x for x in expected], key=lambda x: str(x))
                    is_passed = res_sorted == exp_sorted
                 except:
                    # Fallback if sorting fails
                    is_passed = res == expected
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
