#! node

import { callNpmLink, getGlobalNpmModules } from "./npm.js";

import { getMatchedModules } from "./matchModules.js";
import { getVersionFromPackageJson } from "getVersionFromPackageJson.js";
import { program } from "commander";

const linkIntentMessage = (owner: string|undefined, pattern: string|undefined, exclude: string|undefined): string => {
  let linkedPackageMessage = 'Linking all packages';
  if (owner) {
    linkedPackageMessage = linkedPackageMessage + ' for owner ' + owner;
  }
  if (pattern) {
    linkedPackageMessage = linkedPackageMessage + ' matching pattern ' + pattern;
  }
  if (exclude) {
    linkedPackageMessage = linkedPackageMessage + ' excluding ' + exclude;
  }
  return linkedPackageMessage;
};

const version = await getVersionFromPackageJson();

program
  .version(version, '-v, --version', 'Output the current version')
  .description("Link node_modules based on patterns or owners")
  .argument("[pattern]", "glob pattern to match package names")
  .option("-o, --owner [...<organisation>]", "Owner of the packge")
  .option("-e, --exclude <string>", "Exclude packages that match this pattern")
  .action(async (pattern, options, _command) => {    
    if (!pattern && !options?.owner) {
      console.log(program.description());
      program.outputHelp();
    }

    const linkedPackageMessage = linkIntentMessage(options?.owner, pattern, options?.exclude);
    console.log(linkedPackageMessage);

    const modules = getGlobalNpmModules();
    const matchedLinkedModules: string[] = getMatchedModules(modules, pattern, options?.owner, options?.exclude);

    if (matchedLinkedModules?.length === 0) {
      program.error('No linked modules found to link matching inputs.');
      return;
    }
    callNpmLink(matchedLinkedModules);
    console.log('Linked packages ' + matchedLinkedModules.join(', ') + ' successfully');
  });

await program.parseAsync(process.argv);
