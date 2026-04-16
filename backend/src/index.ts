import { Hono } from "hono";
import matchesRoute from "./routes/matches";

const app = new Hono();

app.get("/", (c) => c.text("Sportz api!"));

app.route("/matches", matchesRoute);

export default app;
