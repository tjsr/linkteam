import { hasOwner, includeModule, isLinkedModule, matchingPackage } from "./checks.js";

describe('isLinkedModule', () => {
  test('returns true if module is linked', () => {
    expect(isLinkedModule({ resolved: '/path/to/module' })).toBe(true);
  });

  test('returns true if module is undefined', () => {
    expect(isLinkedModule({ resolved: undefined })).toBe(false);
  });
});

describe('matchingPackage', () => {
  test('returns true if module matches simple string', () => {
    expect(matchingPackage('module', 'module')).toBe(true);
  });

  test('returns true if module matches a glob', () => {
    expect(matchingPackage('@experimental/something-here-updated', '@experimental/*')).toBe(true);
    expect(matchingPackage('@experimental/something-here-updated', '@experimental/something-*-updated')).toBe(true);
    expect(matchingPackage('@experimental/something-here-updated', '@experimental/*-updated')).toBe(true);
  });

  test('returns false if module does not match string', () => {
    expect(matchingPackage('module', 'nomatch')).toBe(false);
  });

  test('returns true if module does not matches a glob', () => {
    expect(matchingPackage('@foo/something-here-updated', '@experimental/*')).toBe(false);
    expect(matchingPackage('@experimental/something-here-updated', '@experimental/something-else-*')).toBe(false);
    expect(matchingPackage('@experimental/something-here-original', '*-updated')).toBe(false);
  });

  test('returns true if pattern is undefined', () => {
    expect(matchingPackage('module', undefined)).toBe(true);
  });
});

describe('hasOwner', () => {
  test('Should match for an owner with an @ symbol', () => {
    expect(hasOwner('@owner/module', '@owner')).toBe(true);
  });

  test('Should not match for an owner when @ is omitted', () => {
    expect(hasOwner('@someorg/module', 'someorg')).toBe(false);
  });

  test('Should not match for orgs', () => {
    expect(hasOwner('@someorg/module', 'something')).toBe(false);
    expect(hasOwner('@corp/module', '@another')).toBe(false);
  });
});

describe('includeModule', () => {
  test('Should include module if no pattern or owner is provided', () => {
    expect(includeModule('module', undefined, undefined)).toBe(true);
    expect(includeModule('@org/module', undefined, undefined)).toBe(true);
  });

  test('Should include module if no pattern or owner is provided and matches', () => {
    expect(includeModule('module', 'org', undefined)).toBe(false);
    expect(includeModule('module', '@org', undefined)).toBe(false);
    expect(includeModule('@org/module', 'org', undefined)).toBe(false);
    expect(includeModule('@org/module', '@org', undefined)).toBe(true);
  });

  test('Should include module if pattern provided and matches with no org', () => {
    expect(includeModule('module', 'org', 'foo*')).toBe(false);
    expect(includeModule('module', '@org', undefined)).toBe(false);
    expect(includeModule('@org/some-module', undefined, 'org/some-module')).toBe(false);
    expect(includeModule('@org/some-module', undefined, 'org/*')).toBe(false);
    expect(includeModule('@org/some-module', undefined, '@org/*-module')).toBe(true);
  });
});
