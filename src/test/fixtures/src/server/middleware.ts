type Middleware<Ctx> = (ctx: Ctx, next: () => Promise<void>) => Promise<void>;

export const requestLogger: Middleware<{ method: string; url: string }> = async (ctx, next) => {
  const startedAt = Date.now();
  await next();
  console.log(`${ctx.method} ${ctx.url} (${Date.now() - startedAt}ms)`);
};

export const cors: Middleware<{ headers: Record<string, string> }> = async (ctx, next) => {
  ctx.headers['Access-Control-Allow-Origin'] = '*';
  await next();
};

export const errorBoundary: Middleware<{ error?: Error }> = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.error = error as Error;
  }
};
