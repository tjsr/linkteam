import { CheckedModule } from "./matchModules.js";
import { execSync } from "child_process";
import { getCommandOutputPromise } from "./execUtils.js";
import { isLinkedModule } from "./checks.js";
import v8 from 'v8';

const stripQuotes = (str: string) => str?.replace(/^"|"$/g, '');

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

export const getNameFromNpmPkg = (): string => {
  const command = 'npm pkg get name';
  const outpuBuffer: Buffer = execSync(command);
  const packageString = stripQuotes(outpuBuffer.toString().trim());
  return packageString;
};

const getNpmModulesFromCommand = async (command: string): Promise<NpmModule[]> => {
  const jsonString = await getCommandOutputPromise(command, false);

  if (jsonString === undefined) {
    throw new Error(`undefined JSON returned from command ${command}`);
  } else if (jsonString === null) {
    throw new Error(`null JSON returned from command ${command}`);
  } else if (jsonString === "") {
    throw new Error(`empty JSON returned from command ${command}`);
  }

  try {
    const json = JSON.parse(jsonString);
    const jsonSize = estimateObjectSize(json);
    
    if (json.dependencies) {
      console.debug(`Returned \`${command}\` json object of ${jsonSize} bytes.`);
      delete json.dependencies[json.name];
      const modules = getModuleDetails(json.dependencies);
      return modules;
    } else {
      console.debug(`Returned \`${command}\` json object of ${jsonSize} bytes with no dependencies returned.`);
    }
    return [];
  } catch (err) {
    console.error('Error parsing JSON', err);
    throw err;
  }
};

export const getGlobalNpmModules = async (): Promise<NpmModule[]> => {
  const command = 'npm ls -g --json';
  return getNpmModulesFromCommand(command);
};

export const getProdNpmModules = async (): Promise<NpmModule[]> => {
  const mainCommand = 'npm ls --json --omit=dev';
  const packageModules = await getNpmModulesFromCommand(mainCommand);
  packageModules.forEach((module: NpmModule) => {
    module.isDevDependency = false;
  });
  return packageModules;
};

export const getDevNpmModules = async (packageModules: NpmModule[]): Promise<NpmModule[]> => {
  const packageModuleNames = packageModules.map((module: NpmModule) => module.name);
  const devCommand = 'npm ls --json --include=dev';

  const devCommandModules = await getNpmModulesFromCommand(devCommand);
  const devModules = devCommandModules.filter(
    (module: NpmModule) => !packageModuleNames.includes(module.name));
  devModules.forEach((module: NpmModule) => {
    module.isDevDependency = true;
  });
  return devModules;
};

export const getNpmModules = async (devOnly: boolean = false): Promise<NpmModule[]> => {
  const packageModules: NpmModule[] = await getProdNpmModules();
  const devModules = await getDevNpmModules(packageModules);

  if (devOnly) {
    return devModules;
  }
  return [
    ...packageModules,
    ...devModules,
  ];
};

export const getModuleDetails = (modules: Record<string, CheckedModule>): NpmModule[] => {
  if (modules === undefined) {
    return [];
  }
  return Array.from(Object.keys(modules)).map((key) => {
    const moduleData:CheckedModule = (modules as Record<string, CheckedModule>)[key] as unknown as CheckedModule;
    const npmMod: NpmModule = {
      hasGlobalLink: moduleData.resolved !== undefined,
      isOverridden: moduleData.overridden,
      name: key,
      version: moduleData.version,
    };
    return npmMod;
  });
};

export const getLinkedModules = (modules: Record<string, CheckedModule>): string[] => {
  if (modules === undefined) {
    return [];
  }
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
