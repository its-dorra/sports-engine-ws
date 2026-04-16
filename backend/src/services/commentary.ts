import z from "zod";
import { createCommentarySchema } from "../schemas/commentary";
import { db } from "../db";
import { commentary } from "../db/schema";
import { desc, eq } from "drizzle-orm";

class CommentaryService {
  async getAll(matchId: number, limit: number) {
    return db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);
  }

  async create(matchId: number, data: z.infer<typeof createCommentarySchema>) {
    const [commentaryValue] = await db
      .insert(commentary)
      .values({
        matchId,
        ...data,
      })
      .returning();

    return commentaryValue;
  }
}

export const commentaryService = new CommentaryService();
