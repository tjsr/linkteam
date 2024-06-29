import fs, { PathLike } from "fs";

import { findPackageJson } from "./findPackageJson.js";

export const getVersionFromPackageJson = async (packageJsonPath?: PathLike|undefined): Promise<string> => {
  if (!packageJsonPath) {
    packageJsonPath = findPackageJson();
  }

  return new Promise((resolve, reject) => {
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      const packageJson = JSON.parse(data);
      resolve(packageJson.version);
    });
  });
};
