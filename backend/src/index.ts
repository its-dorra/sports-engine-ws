import { Hono } from "hono";
import matchesRoute from "./routes/matches";
import { websocket } from "hono/bun";
import { attachWebSocketHandler } from "./ws/server";
import { arcjetMiddleware } from "./arcjet";

const app = new Hono();

app.use(arcjetMiddleware);

app.get("/", (c) => c.text("Sportz api!"));

app.route("/matches", matchesRoute);

attachWebSocketHandler(app);

Bun.serve({
  fetch: app.fetch,
  websocket: {
    ...websocket,
    maxPayloadLength: 1024 * 1024,
    sendPings: true,
    perMessageDeflate: true,
  },
});
