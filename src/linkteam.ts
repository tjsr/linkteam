#! node

import {
  NpmModule,
  callNpmLink,
  getGlobalNpmModules,
  getNpmModules,
  getProdNpmModules
} from "./npm.js";
import { findPackageJson, getVersionFromPackageJson } from "@tjsr/package-json-utils";

import { hasMatchParams } from "./params.js";
import { includeModule } from "./checks.js";
import { program } from "commander";

const linkIntentMessage = (
  owners: string[]|undefined,
  patterns: string[]|undefined,
  exclude: string|undefined
): string => {
  let hasClause = false;
  let linkedPackageMessage = 'Linking packages';
  if (owners) {
    linkedPackageMessage = linkedPackageMessage + ' for owners ' + owners.join(', ');
    hasClause = true;
  }
  if (patterns) {
    linkedPackageMessage = linkedPackageMessage + ' matching patterns ' + patterns.join(', ');
    hasClause = true;
  }
  if (exclude) {
    linkedPackageMessage = linkedPackageMessage + ' excluding ' + exclude;
    hasClause = true;
  }

  if (!hasClause) {
    return 'Linking all packages referenced by project';
  }

  return linkedPackageMessage;
};

const packageJsonPath = findPackageJson(import.meta.dirname);
const version = await getVersionFromPackageJson(packageJsonPath);

const validateOwners = (owner: string): void => {
  if (owner !== undefined && owner.indexOf('/') > -1) {
    throw new Error('Owner cannot contain /');
  }
};

const ownerList = (values: string): string[] => {
  const owners = values.split(',');
  owners.forEach(validateOwners);
  return owners;
};

const patternList = (values: string): string[] => {
  return values.split(',');
};

const getModulesForProject = async (devOnly: boolean, excludeDev: boolean): Promise<NpmModule[]> => {
  const projectModules: Promise<NpmModule[]> = excludeDev ? getProdNpmModules() : getNpmModules(devOnly);
  return projectModules;
};

program
  .version(version, '-v, --version', 'Output the current version')
  .description("Link node_modules based on patterns or owners")
  .argument("[pattern]", "glob pattern to match package names", patternList)
  .option("-o, --owner <organisation...>", "Owner of the packge", ownerList)
  .option("-e, --exclude <string>", "Exclude packages that match this pattern")
  .option("-d --devOnly", "Show only devDependencies")
  .option("-xd --excludeDev", "Exclude devDependencies")
  .option('-s --show', 'Show packages available for linking')
  .option('--verbose', 'Output verbose messages')
  .action(async (pattern: string[], options, _command) => {
    if (!options.verbose) {
      console.debug = () => {};
    }
    console.debug('Running with options:', options);
    // if (!pattern && !options?.owner && !options.show) {
    //   console.log(program.description());
    //   program.outputHelp();
    // }

    const owners: string[] = options?.owner;

    const projectModules: NpmModule[] = await getModulesForProject(options?.devOnly, options?.excludeDev);

    if (projectModules.length === 0) {
      program.error('Error: No modules found in project');
      return;
    }

    const modules: NpmModule[] = await getGlobalNpmModules();
    const globalLinkedModules = modules.filter((module: NpmModule) => module.hasGlobalLink);
    const maxModuleNameLength: number = Math.max(...globalLinkedModules.map((module: NpmModule) => module.name.length));
    
    const projectModuleNames: string[] = projectModules.map((module: NpmModule) => module.name);

    if (options?.show) {
      console.log('Project modules:', projectModuleNames.join(', '));
      const linkedPackageMessage = linkIntentMessage(owners, pattern, options?.exclude);
      console.log(linkedPackageMessage);

      console.log('The following modules are installed in the global npm node_modules and are linked to local copies:');
      globalLinkedModules.forEach((currentModule: NpmModule) => {
        const usageString = currentModule.isCurrentProject ? 'Excluded'
          : projectModuleNames.includes(currentModule.name) ? 'Referenced' : 'Not used';
        console.log('  ' + currentModule.name.padEnd(maxModuleNameLength), '(' + usageString + ')');
      });
    }

    const linkedModulesInProject = globalLinkedModules.filter(
      (module: NpmModule) => projectModuleNames.includes(module.name));
    console.debug('Linked in project: ', projectModuleNames);
    console.debug('Linked global modules: ', globalLinkedModules);
    console.debug('Linked modules in project: ', linkedModulesInProject);
    const matchedLinkedModules: NpmModule[] = linkedModulesInProject.filter(
      (module: NpmModule) => module.hasGlobalLink && includeModule(module.name, owners, options.patterns)
    );

    if (matchedLinkedModules?.length === 0) {
      if (hasMatchParams(pattern, owners, options?.exclude)) {
        program.error('No search parameters found, but no globally linked modules were found in project.');
      } else {
        program.error('No modules used by project were found having globally linked modules and matching inputs.');
      }
      return;
    }

    callNpmLink(matchedLinkedModules);
    if (hasMatchParams(pattern, owners, options?.exclude)) {
      console.log(`Linked ${matchedLinkedModules?.length} packages ${matchedLinkedModules.map(
        (module) => module.name).join(', ')} matching input params.`);
    } else {
      console.log(`Linked ${matchedLinkedModules?.length} packages ${matchedLinkedModules.map(
        (module) => module.name).join(', ')} from project.`);  
    }
  }); 

await program.parseAsync(process.argv);
