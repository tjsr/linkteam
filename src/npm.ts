import { execSync } from "child_process";

export const getGlobalNpmModules = (): object => {
  try {
    const outpuBuffer: Buffer = execSync("npm ls -g --json");
    const jsonString = outpuBuffer.toString();
    const json = JSON.parse(jsonString);
    return json.dependencies;
  } catch (err) {
    console.error('Error calling `npm ls`', err);
    throw err;
  }
};

export const callNpmLink = (modules: string[]): void => {
  const linkString: string = modules.join(" ");

  try {
    execSync(`npm link ${linkString}`);
  } catch (err) {
    console.error('Error linking modules', err);
    throw err;
  }
};
