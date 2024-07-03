#! node

import {
  NpmModule,
  callNpmLink,
  getGlobalNpmModules,
  getNameFromNpmShow,
  getNpmModules
} from "./npm.js";

import { getVersionFromPackageJson } from "./getVersionFromPackageJson.js";
import { hasMatchParams } from "params.js";
import { includeModule } from "checks.js";
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

const version = await getVersionFromPackageJson();

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

const getModulesForProject = (currentPackage: string, devOnly: boolean, excludeDev: boolean): NpmModule[] => {
  // const currentPackage: string = getNameFromNpmShow();
  let projectModules: NpmModule[] = getNpmModules();
  projectModules.forEach((module: NpmModule) => {
    if (module.name === currentPackage) {
      module.isCurrentProject = true;
    }
  });

  projectModules = projectModules.filter((module: NpmModule) =>
    (devOnly && module.isDevDependency) || (excludeDev && module.isDevDependency));

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

    const currentPackage: string = getNameFromNpmShow();
    const projectModules: NpmModule[] = getModulesForProject(currentPackage, options?.devOnly, options?.excludeDev);

    const modules: NpmModule[] = getGlobalNpmModules();
    const globalLinkedModules = modules.filter((module: NpmModule) => module.hasGlobalLink);
    const maxModuleNameLength: number = Math.max(...globalLinkedModules.map((module: NpmModule) => module.name.length));
    
    const projectModuleNames: string[] = projectModules.map((module: NpmModule) => module.name);
    if (options?.show) {
      const linkedPackageMessage = linkIntentMessage(owners, pattern, options?.exclude);
      console.log('Linking modules:', linkedPackageMessage);
      globalLinkedModules.forEach((currentModule: NpmModule) => {
        const usageString = currentModule.isCurrentProject ? 'Excluded'
          : projectModuleNames.includes(currentModule.name) ? 'Referenced' : 'Not used';
        console.log('  ' + currentModule.name.padEnd(maxModuleNameLength), '(' + usageString + ')');
      });
    }

    const linkedModulesInProject = globalLinkedModules.filter(
      (module: NpmModule) => projectModuleNames.includes(module.name));
    console.debug('Linked in project: ', projectModuleNames, globalLinkedModules, linkedModulesInProject);
    const matchedLinkedModules: NpmModule[] = linkedModulesInProject.filter(
      (module: NpmModule) => module.hasGlobalLink && includeModule(module.name, owners, options.patterns)
    );

    console.debug('Finished matching modules to params:', matchedLinkedModules?.length);
    if (matchedLinkedModules?.length === 0) {
      program.error('No linked modules found to link matching inputs.');
      return;
    }

    callNpmLink(matchedLinkedModules);
    if (hasMatchParams(pattern, owners, options?.exclude)) {
      console.log('Linked packages ' + matchedLinkedModules.join(', ') + ' successfully');
    }
  }); 

await program.parseAsync(process.argv);
