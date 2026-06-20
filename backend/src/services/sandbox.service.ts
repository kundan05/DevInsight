import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import logger from '../utils/logger';

const docker = new Docker();

interface SandboxConfig {
  timeout: number;
  memoryLimit: number;
  cpuCount: number;
  networkDisabled: boolean;
  readOnly: boolean;
}

interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
  timedOut: boolean;
}

interface TestCase {
  input: any;
  expectedOutput: any;
  isHidden?: boolean;
}

export interface TestResult {
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  executionTime: number;
  error?: string;
}

export interface SubmissionResult {
  totalTests: number;
  testsPassed: number;
  totalTime: number;
  results: TestResult[];
}

const LANGUAGE_CONFIGS: Record<string, {
  image: string;
  filename: string;
  compileCmd?: string[];
  runCmd: string[];
  runner: string;
}> = {
  javascript: {
    image: 'node:20-alpine',
    filename: 'solution.js',
    runCmd: ['node', '/sandbox/solution.js'],
    runner: 'node',
  },
  typescript: {
    image: 'node:20-alpine',
    filename: 'solution.ts',
    compileCmd: ['npx', 'tsc', '/sandbox/solution.ts', '--outDir', '/sandbox', '--target', 'ES2020'],
    runCmd: ['node', '/sandbox/solution.js'],
    runner: 'node',
  },
  python: {
    image: 'python:3.12-alpine',
    filename: 'solution.py',
    runCmd: ['python3', '/sandbox/solution.py'],
    runner: 'python',
  },
  java: {
    image: 'openjdk:21-jdk-slim',
    filename: 'Solution.java',
    compileCmd: ['javac', '/sandbox/Solution.java'],
    runCmd: ['java', '-cp', '/sandbox', 'Solution'],
    runner: 'java',
  },
  cpp: {
    image: 'gcc:13-bookworm',
    filename: 'solution.cpp',
    compileCmd: ['g++', '-o', '/sandbox/solution', '/sandbox/solution.cpp', '-std=c++20', '-O2'],
    runCmd: ['/sandbox/solution'],
    runner: 'cpp',
  },
  go: {
    image: 'golang:1.22-alpine',
    filename: 'solution.go',
    runCmd: ['go', 'run', '/sandbox/solution.go'],
    runner: 'go',
  },
  rust: {
    image: 'rust:1.77-slim-bookworm',
    filename: 'solution.rs',
    compileCmd: ['rustc', '-O', '/sandbox/solution.rs', '-o', '/sandbox/solution'],
    runCmd: ['/sandbox/solution'],
    runner: 'rust',
  },
};

const DEFAULT_CONFIG: SandboxConfig = {
  timeout: 5000,
  memoryLimit: 128 * 1024 * 1024,
  cpuCount: 1,
  networkDisabled: true,
  readOnly: true,
};

export class SandboxService {
  private async ensureImage(image: string): Promise<void> {
    try {
      await docker.getImage(image).inspect();
    } catch {
      logger.info(`Pulling Docker image: ${image}`);
      await new Promise<void>((resolve, reject) => {
        docker.pull(image, (err: any, stream: any) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
    }
  }

  private generateWrappedCode(
    sourceCode: string,
    testCases: TestCase[],
    language: string,
  ): string {
    const testCasesJson = JSON.stringify(testCases);

    const wrappers: Record<string, (code: string, tests: TestCase[]) => string> = {
      javascript: (code, tests) => `
const testCases = ${JSON.stringify(tests)};
const results = [];
const startTime = process.hrtime.bigint();

for (let i = 0; i < testCases.length; i++) {
  try {
    const t = testCases[i];
    const input = t.input;
    const expected = t.expectedOutput;
    const testStart = process.hrtime.bigint();

    // User code
    ${code}

    // If user exports a function, call it with input
    const fn = typeof module !== 'undefined' && module.exports ? module.exports : (globalThis.solution || (() => {}));
    const actual = typeof fn === 'function' ? fn(input) : fn;

    const testEnd = process.hrtime.bigint();
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    results.push({
      passed,
      input,
      expected,
      actual,
      executionTime: Number(testEnd - testStart) / 1e6,
    });
  } catch (e) {
    results.push({
      passed: false,
      input: testCases[i].input,
      expected: testCases[i].expectedOutput,
      actual: null,
      executionTime: 0,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

const endTime = process.hrtime.bigint();
const output = {
  totalTests: testCases.length,
  testsPassed: results.filter(r => r.passed).length,
  totalTime: Number(endTime - startTime) / 1e6,
  results,
};
process.stdout.write(JSON.stringify(output));
process.exit(0);
`,
      python: (code, tests) => `
import json, time, sys, traceback

test_cases = ${JSON.stringify(tests)}
results = []
start = time.time()

exec("""
${code}
""", globals())

for i, t in enumerate(test_cases):
    try:
        inp = t["input"]
        expected = t["expectedOutput"]
        t_start = time.time()

        if "solution" in dir():
            actual = solution(inp)
        elif "Solution" in dir():
            actual = Solution().solve(inp)
        else:
            actual = None

        t_end = time.time()
        passed = json.dumps(actual, default=str) == json.dumps(expected, default=str)
        results.append({
            "passed": passed,
            "input": inp,
            "expected": expected,
            "actual": actual,
            "executionTime": (t_end - t_start) * 1000,
        })
    except Exception as e:
        results.append({
            "passed": False,
            "input": t["input"],
            "expected": t["expectedOutput"],
            "actual": None,
            "executionTime": 0,
            "error": traceback.format_exc(),
        })

total_time = (time.time() - start) * 1000
output = {
    "totalTests": len(test_cases),
    "testsPassed": sum(1 for r in results if r["passed"]),
    "totalTime": total_time,
    "results": results,
}
print(json.dumps(output, default=str))
`,
      java: (code, tests) => {
        const testCode = `
import java.util.*;
import com.google.gson.*;

public class Solution {
    static class TestCase {
        Object input;
        Object expectedOutput;
    }

    static class TestResult {
        boolean passed;
        Object input;
        Object expected;
        Object actual;
        double executionTime;
        String error;
    }

    static class Output {
        int totalTests;
        int testsPassed;
        double totalTime;
        List<TestResult> results;
    }

    public static void main(String[] args) {
        Gson gson = new Gson();
        TestCase[] testCases = gson.fromJson(${JSON.stringify(JSON.stringify(tests))}, TestCase[].class);
        List<TestResult> results = new ArrayList<>();
        long start = System.nanoTime();

        for (int i = 0; i < testCases.length; i++) {
            TestResult tr = new TestResult();
            long tStart = System.nanoTime();
            try {
                // User code injected here
                ${code}
                Object actual = solve(testCases[i].input);
                long tEnd = System.nanoTime();
                tr.passed = gson.toJson(actual).equals(gson.toJson(testCases[i].expectedOutput));
                tr.input = testCases[i].input;
                tr.expected = testCases[i].expectedOutput;
                tr.actual = actual;
                tr.executionTime = (tEnd - tStart) / 1e6;
            } catch (Exception e) {
                tr.passed = false;
                tr.input = testCases[i].input;
                tr.expected = testCases[i].expectedOutput;
                tr.error = e.toString();
            }
            results.add(tr);
        }

        long end = System.nanoTime();
        Output out = new Output();
        out.totalTests = testCases.length;
        out.testsPassed = (int) results.stream().filter(r -> r.passed).count();
        out.totalTime = (end - start) / 1e6;
        out.results = results;
        System.out.println(gson.toJson(out));
    }
}
`;
        return testCode;
      },
    };

    return wrappers[language]?.(sourceCode, testCases) ?? sourceCode;
  }

  async execute(
    sourceCode: string,
    language: string,
    testCases: TestCase[],
    config: Partial<SandboxConfig> = {},
  ): Promise<SubmissionResult> {
    const langConfig = LANGUAGE_CONFIGS[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const cfg = { ...DEFAULT_CONFIG, ...config };
    const containerId = uuidv4().slice(0, 8);
    const tmpDir = path.join(os.tmpdir(), `sandbox-${containerId}`);

    try {
      await fs.mkdir(tmpDir, { recursive: true });

      const wrappedCode = this.generateWrappedCode(sourceCode, testCases, language);
      await fs.writeFile(path.join(tmpDir, langConfig.filename), wrappedCode);

      if (language === 'java') {
        const gradleDeps = `
dependencies {
  implementation 'com.google.code.gson:gson:2.10.1'
}
`;
        await fs.writeFile(path.join(tmpDir, 'build.gradle'), gradleDeps);
      }

      await this.ensureImage(langConfig.image);

      const hostConfig: any = {
        Binds: [`${tmpDir}:/sandbox:ro`],
        Memory: cfg.memoryLimit,
                NanoCpus: cfg.cpuCount * 1e9,
        NetworkMode: cfg.networkDisabled ? 'none' : 'bridge',
        ReadonlyRootfs: true,
        SecurityOpt: ['no-new-privileges:true'],
        CapDrop: ['ALL'],
        ReadonlyPaths: ['/sandbox'],
      };

      const createConfig: any = {
        Image: langConfig.image,
        Cmd: langConfig.runCmd,
        WorkingDir: '/sandbox',
        HostConfig: hostConfig,
        Env: [
          'NODE_PATH=/usr/local/lib/node_modules',
          'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        ],
      };

      if (langConfig.compileCmd) {
        const compileContainer = await docker.createContainer({
          Image: langConfig.image,
          Cmd: langConfig.compileCmd,
          WorkingDir: '/sandbox',
          HostConfig: {
            Binds: [`${tmpDir}:/sandbox:rw`],
            Memory: cfg.memoryLimit,
            NanoCpus: cfg.cpuCount * 1e9,
            NetworkMode: 'none',
            ReadonlyRootfs: true,
            SecurityOpt: ['no-new-privileges:true'],
            CapDrop: ['ALL'],
          },
        });

        await compileContainer.start();
        const compileResult = await compileContainer.wait({
          condition: 'next-exit',
        });

        const compileLogs = await compileContainer.logs({
          stdout: true,
          stderr: true,
        });
        await compileContainer.remove();

        if (compileResult.StatusCode !== 0) {
          return {
            totalTests: testCases.length,
            testsPassed: 0,
            totalTime: 0,
            results: testCases.map((tc) => ({
              passed: false,
              input: tc.input,
              expected: tc.expectedOutput,
              actual: null,
              executionTime: 0,
              error: `Compilation error:\n${compileLogs.toString()}`,
            })),
          };
        }
      }

      const container = await docker.createContainer(createConfig);
      await container.start();

      const timeoutHandle = setTimeout(async () => {
        try {
          await container.kill();
        } catch {
          // container may already be stopped
        }
      }, cfg.timeout);

      const waitResult = await container.wait({ condition: 'next-exit' });
      clearTimeout(timeoutHandle);

      const logs = await container.logs({ stdout: true, stderr: true });
      await container.remove();

      const stdout = logs.toString();
      const timedOut = waitResult.StatusCode === 137;

      if (timedOut) {
        return {
          totalTests: testCases.length,
          testsPassed: 0,
          totalTime: cfg.timeout,
          results: testCases.map((tc) => ({
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: null,
            executionTime: cfg.timeout,
            error: 'Execution timed out',
          })),
        };
      }

      const jsonMatch = stdout.match(/\{.*"totalTests".*\}/s);
      if (!jsonMatch) {
        return {
          totalTests: testCases.length,
          testsPassed: 0,
          totalTime: 0,
          results: testCases.map((tc) => ({
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            actual: null,
            executionTime: 0,
            error: `No results returned. Exit code: ${waitResult.StatusCode}. Stderr: ${stdout.slice(0, 500)}`,
          })),
        };
      }

      return JSON.parse(jsonMatch[0]) as SubmissionResult;
    } catch (error: any) {
      logger.error('Sandbox execution error:', error);
      return {
        totalTests: testCases.length,
        testsPassed: 0,
        totalTime: 0,
        results: testCases.map((tc) => ({
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          executionTime: 0,
          error: `Sandbox error: ${error.message}`,
        })),
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
