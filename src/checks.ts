import { hasValue } from "./params.js";
import { minimatch } from "minimatch";

export const matchesOwner = (module: string, owners: string|string[]|undefined): boolean => {
  if (typeof owners === 'string') {
    owners = [owners];
  }
  return owners === undefined || owners.filter(
    (o: string) => module.startsWith(o)
  ).length > 0;
};

export const packageNameMatchesAnyPattern = (module: string, pattern: string|string[]|undefined): boolean => {
  if (typeof pattern === 'string') {
    return packageNameMatchesPattern(module, pattern);
  }
  if (pattern === undefined) {
    return true;
  }
  return pattern.filter((p: string) => packageNameMatchesPattern(module, p)).length > 0;
};

export const packageNameMatchesPattern = (module: string, pattern: string|undefined): boolean => {
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
  const hasPattern = hasValue(patterns);
  if (hasPattern && packageNameMatchesAnyPattern(moduleName, patterns)) {
    return true;
  }
  
  const hasOwner = hasValue(owners);
  if (hasOwner && matchesOwner(moduleName, owners)) {
    return true;
  }

  if (!hasPattern && !hasOwner) {
    return true;
  }
  return false;
};
