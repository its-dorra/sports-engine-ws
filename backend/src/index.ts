import { Hono } from "hono";
import { websocket } from "hono/bun";
import { attachWebSocketHandler } from "./ws/server";
import { arcjetMiddleware } from "./arcjet";

import matchesRoute from "./routes/matches";
import commentariesRoute from "./routes/commentaries";

const app = new Hono();

app.use(arcjetMiddleware);

app.get("/", (c) => c.text("Sportz api!"));

app.route("/matches", matchesRoute);
app.route("/matches/:matchId/commentaries", commentariesRoute);

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
