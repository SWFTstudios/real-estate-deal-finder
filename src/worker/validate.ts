import type { MiddlewareHandler } from "hono";
import type { ZodTypeAny, z } from "zod";

// Small JSON body validator so we avoid an extra dependency.
export function zValidator<T extends ZodTypeAny>(schema: T): MiddlewareHandler<
  any,
  any,
  { out: { json: z.infer<T> } }
> {
  return async (c, next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
    }
    c.req.addValidatedData("json", parsed.data);
    await next();
  };
}
