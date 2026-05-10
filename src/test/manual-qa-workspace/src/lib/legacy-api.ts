export namespace LegacyApi {
  export interface Request {
    method: string;
    url: string;
    body?: unknown;
  }

  export interface Response<T> {
    status: number;
    data: T;
  }

  export function call<T>(request: Request): Promise<Response<T>> {
    return Promise.resolve({ status: 200, data: {} as T });
  }

  export const VERSION = '1.0.0';
}
