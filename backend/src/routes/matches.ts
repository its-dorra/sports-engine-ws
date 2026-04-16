import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createMatchSchema, listMatchesQuerySchema } from "../schemas/matches";
import { matchesService } from "../services/matches";
import { broadCastMatchCreated } from "../ws/matches.ws";

const app = new Hono();

app.get("/", zValidator("query", listMatchesQuerySchema), async (c) => {
  const { limit } = c.req.valid("query");
  try {
    const matches = await matchesService.getAll(limit);
    return c.json({ data: matches });
  } catch (error) {
    return c.json({ error: "Failed to fetch matches" }, 500);
  }
});

app.post("/", zValidator("json", createMatchSchema), async (c) => {
  const matchData = c.req.valid("json");

  try {
    const data = await matchesService.create(matchData);
    broadCastMatchCreated(data);
    return c.json({ data }, 201);
  } catch {
    return c.json({ error: "Failed to create match" }, 500);
  }
});

export default app;
