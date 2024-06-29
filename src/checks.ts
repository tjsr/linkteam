import { minimatch } from "minimatch";

export const hasOwner = (module: string, owner: string): boolean => {
  return owner === undefined || module.startsWith(owner);
};

export const matchingPackage = (module: string, pattern: string|undefined): boolean => {
  return pattern === undefined || minimatch(module, pattern);
};

export const isLinkedModule = (module: { resolved: string|undefined } ): boolean => {
  return module.resolved !== undefined;
};

export const includeModule = (moduleName: string, owner: string|undefined, pattern: string|undefined): boolean => {
  if (pattern) {
    try {
      if (matchingPackage(moduleName, pattern)) {
        return true;
      }
    } catch (err) {
      console.error('Error matching package', moduleName, pattern);
      throw err;
    }
  }
  if (owner) {
    return hasOwner(moduleName, owner);
  }
  if (!pattern && !owner) {
    return true;
  }
  return false;
};
