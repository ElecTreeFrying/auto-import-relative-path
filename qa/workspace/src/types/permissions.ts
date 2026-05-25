export const enum Permission {
  Read = 1 << 0,
  Write = 1 << 1,
  Delete = 1 << 2,
  Admin = Read | Write | Delete,
}

export const enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
