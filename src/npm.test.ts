import { NpmModule, getDevNpmModules, getNameFromNpmPkg, getNpmModules, getProdNpmModules } from "./npm.js";

const expectModule = (modules: NpmModule[], name: string, isDevDependency: boolean = false) => {
  const foundModule = modules.find((module: NpmModule) => module.name === name);
  expect(foundModule).not.toBeUndefined();
  expect(foundModule?.isDevDependency).toBe(isDevDependency);
};

const expectModuleNotPresent = (modules: NpmModule[], name: string) => {
  const foundModule = modules.find((module: NpmModule) => module.name === name);
  expect(foundModule).toBeUndefined();
};

describe('getProdNpmModules', () => {
  it('should return an array of NpmModule objects with isDevDependency set to false', async () => {
    const packageModules = await getProdNpmModules();
    expect(packageModules).toBeTruthy();
    expect(packageModules.length).toBeGreaterThan(0);
    packageModules.forEach((module: NpmModule) => {
      expect(module.isDevDependency).toBe(false);
    });
  });

  it('Should have commander, minimatch and nodemon as the only dependencies', async () => {
    const packageModules = await getProdNpmModules();
    expect(packageModules.length).toBe(3);

    expectModule(packageModules, 'commander');
    expectModule(packageModules, 'minimatch');
    expectModule(packageModules, 'nodemon');
  });
});

describe('getDevNpmModules', () => {
  let packageModules: NpmModule[];
  let devModules: NpmModule[];

  beforeAll(async () => {
    packageModules = await getProdNpmModules();
    devModules = await getDevNpmModules(packageModules);
  });

  test('should return an array with known prod modules having isDevDependency false', () => {
    expect(devModules).toBeTruthy();
    expect(devModules.length).toBeGreaterThan(0);

    expectModuleNotPresent(devModules, 'commander');
    expectModuleNotPresent(devModules, 'minimatch');
    expectModuleNotPresent(devModules, 'nodemon');
  });

  test('should return an array of NpmModule objects with isDevDependency set to true', () => {
    expect(devModules).toBeTruthy();
    expect(devModules.length).toBeGreaterThan(0);

    devModules.forEach((module: NpmModule) => {
      expect(module.isDevDependency).toBe(true);
    });
  });
});

describe('getNpmModules', () => {
  let packageModules: NpmModule[];
  beforeAll(async () => {
    packageModules = await getNpmModules();
  });

  test('should return an array of NpmModule objects with isDevDependency set to false', () => {
    expectModule(packageModules, 'commander', false);
    expectModule(packageModules, 'minimatch', false);
    expectModule(packageModules, 'nodemon', false);
  });

  test('should return an array of NpmModule objects with isDevDependency set to true', () => {
    expectModule(packageModules, 'vitest', true);
    expectModule(packageModules, 'typescript', true);
  });
});

describe('devOnly getNpmModules', () => {
  let packageModules: NpmModule[];
  beforeAll(async () => {
    packageModules = await getNpmModules(true);
  });

  test('Should only return dev modules with devOnly param passed as true', () => {
    expectModuleNotPresent(packageModules, 'commander');
    expectModuleNotPresent(packageModules, 'minimatch');
    expectModuleNotPresent(packageModules, 'nodemon');

    expectModule(packageModules, 'vitest', true);
    expectModule(packageModules, 'typescript', true);
  });
});

describe('getNameFromNpmPkg', () => {
  it('should return the name of the package from package.json', () => {
    const name = getNameFromNpmPkg();
    expect(name).toBe('linkteam');
  });
});
