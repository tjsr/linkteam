import fs from 'fs';
import path from "path";

export const findPackageJson = (): string => {
  const __dirname = import.meta.dirname;
  const searchPath = __dirname;

  let packageJsonPath = path.resolve(searchPath, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  packageJsonPath = path.resolve(searchPath, '../..', "package.json");
  if (fs.existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  throw new Error('Could not find package.json one or two levels below ' + __dirname);
};
