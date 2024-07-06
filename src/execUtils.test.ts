import { ExecException } from 'node:child_process';
import { TaskContext } from 'vitest';
import { getCommandOutputPromise } from "./execUtils.js";

let stdoutData: string;
let stderrData: string;
let errorData: ExecException | null;

describe('getCommandOutputPromise', { concurrent: false }, () => {
  beforeAll(() => {
    errorData = {
      code: 1,
      message: 'Failure Occurred',
      name: 'TestFailure',
    };

    vi.mock('child_process', () => {
      return {
        exec: vi.fn().mockImplementation((_commandString, callback) => {
          callback(errorData, stdoutData, stderrData);
        }),
      };
    });
  });

  beforeEach((context: TaskContext) => {
    stdoutData = context.task.name + "-stdout";
    stderrData = context.task.name + 'err here';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Should return a string from a promise when a command returns a positive termination code.',
    async (context: TaskContext) => {
      const commandString = 'npm ls --json --omit=dev';

      stdoutData = context.task.name + "-stdout";
      stderrData = context.task.name + 'err here';

      await expect(getCommandOutputPromise(commandString, false)).resolves.toBe(
        'Should return a string from a promise when a command returns a positive termination code.-stdout');
    });

  test('Should reject when a command returns a positive termination code.', async () => {
    const commandString = 'npm ls --json --omit=dev';

    await expect(getCommandOutputPromise(commandString)).rejects.toStrictEqual({
      code: 1,
      message: 'Failure Occurred',
      name: 'TestFailure',
    });
  });
});
