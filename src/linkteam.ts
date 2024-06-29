#! node

import { callNpmLink, getGlobalNpmModules } from "./npm.js";

import { getMatchedModules } from "./matchModules.js";
import { getVersionFromPackageJson } from "./getVersionFromPackageJson.js";
import { program } from "commander";

const linkIntentMessage = (
  owners: string[]|undefined,
  patterns: string[]|undefined,
  exclude: string|undefined
): string => {
  let linkedPackageMessage = 'Linking all packages';
  if (owners) {
    linkedPackageMessage = linkedPackageMessage + ' for owners ' + owners.join(', ');
  }
  if (patterns) {
    linkedPackageMessage = linkedPackageMessage + ' matching patterns ' + patterns.join(', ');
  }
  if (exclude) {
    linkedPackageMessage = linkedPackageMessage + ' excluding ' + exclude;
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

program
  .version(version, '-v, --version', 'Output the current version')
  .description("Link node_modules based on patterns or owners")
  .argument("[pattern]", "glob pattern to match package names", patternList)
  .option("-o, --owner <organisation...>", "Owner of the packge", ownerList)
  .option("-e, --exclude <string>", "Exclude packages that match this pattern")
  .option('--verbose', 'Output verbose messages')
  .action(async (pattern: string[], options, _command) => {
    if (!options.verbose) {
      console.debug = () => {};
    }
    console.debug('Running with options:', options);
    if (!pattern && !options?.owner) {
      console.log(program.description());
      program.outputHelp();
    }

    const owner: string[] = options?.owner;

    const linkedPackageMessage = linkIntentMessage(owner, pattern, options?.exclude);
    console.log(linkedPackageMessage);

    const modules = getGlobalNpmModules();
    const matchedLinkedModules: string[] = getMatchedModules(modules, pattern, owner, options?.exclude);

    console.debug('Finished matching modules to params:', matchedLinkedModules?.length);
    if (matchedLinkedModules?.length === 0) {
      program.error('No linked modules found to link matching inputs.');
      return;
    }

    callNpmLink(matchedLinkedModules);
    console.log('Linked packages ' + matchedLinkedModules.join(', ') + ' successfully');
  });

await program.parseAsync(process.argv);
