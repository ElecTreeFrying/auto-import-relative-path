export function memoize<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const cache = new Map<string, Return>();
  return function (this: This, ...args: Args): Return {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as Return;
    const result = target.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

export const Deprecated = (reason: string) =>
  function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    _context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
  ) {
    return function (this: This, ...args: Args): Return {
      console.warn(`Deprecated: ${reason}`);
      return target.apply(this, args);
    };
  };
