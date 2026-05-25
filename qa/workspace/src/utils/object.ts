export function pick<T extends object, K extends keyof T>(source: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in source) result[key] = source[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(source: T, keys: K[]): Omit<T, K> {
  const result = { ...source };
  for (const key of keys) delete result[key];
  return result;
}
