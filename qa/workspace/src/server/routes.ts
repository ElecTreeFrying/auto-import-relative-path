interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: () => Promise<unknown>;
}

function registerRoute(method: Route['method'], path: string, handler: () => Promise<unknown>): Route {
  return { method, path, handler };
}

export const routes: readonly Route[] = [
  registerRoute('GET', '/health', async () => ({ status: 'ok' })),
  registerRoute('GET', '/users/:id', async () => ({})),
  registerRoute('POST', '/users', async () => ({})),
  registerRoute('GET', '/orders', async () => []),
  registerRoute('POST', '/orders', async () => ({})),
];

export function findRoute(method: Route['method'], path: string): Route | undefined {
  return routes.find((route) => route.method === method && route.path === path);
}
