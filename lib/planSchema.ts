import { z } from "zod";

export const DaySchema = z.object({
  id: z.number(),
  day: z.string(),
  distance: z.number().min(0.1).describe("Distance in km - must be positive"),
  "jogging-interval-time": z
    .number()
    .min(1)
    .describe(
      "Duration of EACH jog interval in minutes (same for all intervals)"
    ),
  "walking-intervals-time": z
    .number()
    .min(0)
    .describe(
      "Duration of EACH walk interval in minutes (same for all, or 0 for continuous)"
    ),
  "number-of-intervals": z
    .number()
    .min(1)
    .describe("How many times the jog/walk pattern repeats"),
  instructions: z
    .array(z.string())
    .describe("Array of helpful instructions for this run"),
});

export const WeekSchema = z.object({
  id: z.number(),
  days: z.array(DaySchema),
});

export const PlanSchema = z.object({
  weeks: z.array(WeekSchema).min(1, "Plan must have at least 1 week"),
});

export type DaySchemaType = z.infer<typeof DaySchema>;
export type WeekSchemaType = z.infer<typeof WeekSchema>;
export type PlanSchemaType = z.infer<typeof PlanSchema>;
