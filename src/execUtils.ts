import { ExecException, exec } from "node:child_process";

export const getCommandOutputPromise = async (command: string, throwOnError: boolean = true): Promise<string> => {
  console.debug(`Running \`${command}\``);

  const dataPromise: Promise<string> = new Promise<string>((resolve, reject) => {
    // TODO: How on Earth are we going to test this in a way we can modck out the exec call??
    const execHandler = (err: ExecException | null, stdout: string, stderr: string) => {
      if (err?.code && throwOnError) {
        console.error(stderr.toString());
        reject(err);
      } else {
        resolve(stdout.toString());
      }
    };
    exec(command, execHandler);
  });

  return dataPromise;
};

export const getCommandOutputPromiseAlways = async (command: string): Promise<string> => {
  try {
    const dataPromise = getCommandOutputPromise(command, false);
    
    return dataPromise;
  } catch (err: unknown) {
    console.error(`Error calling \`${command}\``, err);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve((err as any).stdoutData);
  }
};
