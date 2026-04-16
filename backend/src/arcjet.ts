import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/bun";
import { createMiddleware } from "hono/factory";
const arcjetKey = Bun.env.ARCJET_KEY;
const arcjetMode = Bun.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

if (!arcjetKey)
  throw new Error("ARCJET_KEY is not defined in environment variables");

export const httpArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({ mode: arcjetMode }),
    detectBot({
      mode: arcjetMode,
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: arcjetMode,
      interval: "10s",
      max: 50,
    }),
  ],
});

export const webSocketArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({ mode: arcjetMode }),
    detectBot({
      mode: arcjetMode,
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: arcjetMode,
      interval: "2s",
      max: 5,
    }),
  ],
});

export const arcjetMiddleware = createMiddleware(async (c, next) => {
  try {
    const decision = await httpArcjet.protect(c.req.raw);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return c.json({ error: "Too Many Requests" }, 429);
      }
      return c.json({ error: "Forbidden" }, 403);
    }
  } catch (error) {
    console.error("ArcJet middleware error:", error);
    return c.json({ error: "Service Unavailable" }, 503);
  }

  await next();
});
