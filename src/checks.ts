import { minimatch } from "minimatch";

export const hasOwner = (module: string, owners: string|string[]): boolean => {
  if (typeof owners === 'string') {
    owners = [owners];
  }
  return owners === undefined || owners.filter(
    (o: string) => module.startsWith(o)
  ).length > 0;
};

export const matchingAnyPackage = (module: string, pattern: string|string[]|undefined): boolean => {
  if (typeof pattern === 'string') {
    return matchingPackage(module, pattern);
  }
  if (pattern === undefined) {
    return true;
  }
  return pattern.filter((p: string) => matchingPackage(module, p)).length > 0;
};

export const matchingPackage = (module: string, pattern: string|undefined): boolean => {
  return pattern === undefined || minimatch(module, pattern);
};

export const isLinkedModule = (module: { resolved: string|undefined } ): boolean => {
  return module.resolved !== undefined;
};

export const includeModule = (
  moduleName: string,
  owners: string|string[]|undefined,
  patterns: string|string[]|undefined
): boolean => {
  if (typeof owners === 'string') {
    owners = [owners];
  }
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  if (patterns && patterns.length > 0) {
    try {
      if (matchingAnyPackage(moduleName, patterns)) {
        return true;
      }
    } catch (err) {
      console.error('Error matching package', moduleName, patterns);
      throw err;
    }
  }
  if (owners && owners.length > 0) {
    return hasOwner(moduleName, owners);
  }
  if ((!patterns || patterns.length === 0) && (!owners || owners?.length === 0)) {
    return true;
  }
  return false;
};
