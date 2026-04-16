import { z } from "zod";

const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const isValidIsoDateString = (value: string) => {
  if (!isoDateTimeRegex.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    startTime: z.string().refine(isValidIsoDateString, {
      message: "startTime must be a valid ISO date string",
    }),
    endTime: z.string().refine(isValidIsoDateString, {
      message: "endTime must be a valid ISO date string",
    }),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((value, context) => {
    const startTime = Date.parse(value.startTime);
    const endTime = Date.parse(value.endTime);

    if (endTime <= startTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "endTime must be after startTime",
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
