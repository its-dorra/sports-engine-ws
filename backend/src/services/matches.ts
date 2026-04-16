import z from "zod";
import { createMatchSchema } from "../schemas/matches";
import { db } from "../db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

class MatchesService {
  async getAll(limit: number) {
    return db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
  }

  async create(data: z.infer<typeof createMatchSchema>) {
    try {
      const [event] = await db
        .insert(matches)
        .values({
          ...data,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          homeScore: data.homeScore ?? 0,
          awayScore: data.awayScore ?? 0,
          status: getMatchStatus(data.startTime, data.endTime),
        })
        .returning();

      return event;
    } catch {
      throw new Error("Failed to create match");
    }
  }
}

export const matchesService = new MatchesService();
