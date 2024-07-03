import { CheckedModule } from "matchModules.js";
import { execSync } from "child_process";
import { isLinkedModule } from "checks.js";
import v8 from 'v8';

export type NpmModule = {
  hasGlobalLink?: boolean;
  isDevDependency?: boolean;
  isOverridden?: boolean;
  isCurrentProject?: boolean;
  name: string;
  version: string|undefined;
};

const estimateObjectSize = (obj: object): number => {
  const serializedObject = v8.serialize(obj);
  return serializedObject.length;
};

export const getNameFromNpmShow = (): string => {
  const command = 'npm show --json';
  const outpuBuffer: Buffer = execSync(command);
  const jsonString = outpuBuffer.toString();
  const json = JSON.parse(jsonString);
  return json.name;
};

const getNpmModulesFromCommand = (command: string): NpmModule[] => {
  try {
    console.debug(`Running \`${command}\``);
    const outpuBuffer: Buffer = execSync(command);
    console.debug(`Got \`${command}\` result from npm.`);
    const jsonString = outpuBuffer.toString();
    console.debug(`Parsing \`${command}\` JSON...`);
    const json = JSON.parse(jsonString);
    
    const jsonSize = estimateObjectSize(json);
    console.debug(`Returned \`${command}\` json object of ${jsonSize} bytes.`);

    const modules = getModuleDetails(json.dependencies);
    modules.forEach((module: NpmModule) => {
      module.isDevDependency = false;
    });
    const devModules = getModuleDetails(json.devDependencies);
    modules.forEach((module: NpmModule) => {
      module.isDevDependency = true;
    });

    const allModules = modules.concat(devModules);
    return allModules;
  } catch (err) {
    console.error('Error calling `npm ls`', command, err);
    throw err;
  }
};

export const getGlobalNpmModules = (): NpmModule[] => {
  const command = 'npm ls -g --json';
  return getNpmModulesFromCommand(command);
};

export const getNpmModules = (): NpmModule[] => {
  const command = 'npm ls --json';
  return getNpmModulesFromCommand(command);
};

export const getModuleDetails = (modules: Record<string, CheckedModule>): NpmModule[] =>
  Array.from(Object.keys(modules)).map((key) => {
    const moduleData:CheckedModule = (modules as Record<string, CheckedModule>)[key] as unknown as CheckedModule;
    const npmMod: NpmModule = {
      hasGlobalLink: moduleData.resolved !== undefined,
      isOverridden: moduleData.overridden,
      name: key,
      version: moduleData.version,
    };
    return npmMod;
  });

export const getLinkedModules = (modules: Record<string, CheckedModule>): string[] => {
  const linkedModules: string[] = Array.from(Object.keys(modules))
    .filter((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const module: CheckedModule = (modules as Record<string, CheckedModule>)[key] as CheckedModule;

      return isLinkedModule(module);
    });
  return linkedModules;
};

export const callNpmLink = (modules: NpmModule[]): void => {
  const linkString: string = modules?.map((m) => m.name).join(" ");
  
  const command = `npm link ${linkString}`;
  console.debug('Calling npm with command.', command);

  try {
    execSync(command);
  } catch (err) {
    console.error('Error linking modules', err);
    throw err;
  }
};
