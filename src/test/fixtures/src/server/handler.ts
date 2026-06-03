interface RequestContext {
  userId?: string;
  ip: string;
  startedAt: number;
}

export default async function handler(context: RequestContext): Promise<{ statusCode: number; body: string }> {
  const elapsed = Date.now() - context.startedAt;
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, elapsed, userId: context.userId ?? null }),
  };
}
