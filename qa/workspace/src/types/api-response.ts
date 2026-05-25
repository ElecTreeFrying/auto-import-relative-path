export type ApiResponse<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: ApiError; status: number };

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export type Nullable<T> = T | null | undefined;
