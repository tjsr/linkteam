import { execSync } from "child_process";
import v8 from 'v8';

function estimateObjectSize(obj: object): number {
  const serializedObject = v8.serialize(obj);
  return serializedObject.length;
}

export const getGlobalNpmModules = (): object => {
  const command = 'npm ls -g --json';
  try {
    console.debug(`Running \`${command}\``);
    const outpuBuffer: Buffer = execSync(command);
    console.debug('Got result from npm.');
    const jsonString = outpuBuffer.toString();
    console.debug('Parsing JSON...');
    const json = JSON.parse(jsonString);
    
    const jsonSize = estimateObjectSize(json);
    console.debug(`Returned json object of ${jsonSize} bytes.`);
    return json.dependencies;
  } catch (err) {
    console.error('Error calling `npm ls`', command, err);
    throw err;
  }
};

export const callNpmLink = (modules: string[]): void => {
  const linkString: string = modules.join(" ");
  
  const command = `npm link ${linkString}`;
  console.debug('Calling npm with command.', command);

  try {
    execSync(command);
  } catch (err) {
    console.error('Error linking modules', err);
    throw err;
  }
};
