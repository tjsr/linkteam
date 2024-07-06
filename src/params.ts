export const hasMatchParams = (
  pattern: string|string[]|undefined,
  owner: string|string[]|undefined,
  exclude: string|string[]|undefined): boolean => hasValue(pattern) || hasValue(owner) || hasValue(exclude);

export const hasValue = (option: string | string[] | undefined): boolean => {
  if (option === undefined) {
    return false;
  }

  if (typeof option === 'string' && option.trim() !== '') {
    return true;
  }

  if (Array.isArray(option)) {
    return option.length > 0;
  }

  return false;
};
