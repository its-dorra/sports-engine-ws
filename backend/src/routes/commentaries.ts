import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../schemas/commentary";
import { commentaryService } from "../services/commentary";
import { matchIdParamSchema } from "../schemas/matches";
import { broadcastCommentaryCreated } from "../ws/commentaries.ws";

const app = new Hono().use(zValidator("param", matchIdParamSchema));

app.get("/", zValidator("query", listCommentaryQuerySchema), async (c) => {
  const matchId = parseInt(c.req.param("matchId")!);
  const { limit } = c.req.valid("query");

  const data = await commentaryService.getAll(matchId, limit);

  return c.json({ success: true, data });
});

app.post("/", zValidator("json", createCommentarySchema), async (c) => {
  try {
    const matchId = parseInt(c.req.param("matchId")!);
    const data = c.req.valid("json");

    const result = await commentaryService.create(matchId, data);

    broadcastCommentaryCreated(matchId, result);

    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    console.error("Error creating commentary:", error);
    return c.json(
      { success: false, error: "Failed to create commentary" },
      500,
    );
  }
});

export default app;
