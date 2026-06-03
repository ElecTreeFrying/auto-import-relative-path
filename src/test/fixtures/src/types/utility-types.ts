export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type RequiredKeys<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

export type ValueOf<T> = T[keyof T];

export type NonEmptyArray<T> = [T, ...T[]];
