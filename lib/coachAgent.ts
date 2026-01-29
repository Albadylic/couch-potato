"use server";

import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { Plan, DayType } from "@/types/week";
import {
  CoachContext,
  CoachAgentResponse,
} from "@/types/coach";
import { calculateWeekSummaries } from "@/lib/coachUtils";

const PlanChangeSchema = z.object({
  type: z.enum([
    "increase_intensity",
    "decrease_intensity",
    "add_rest_day",
    "extend_timeline",
    "shorten_timeline",
    "adjust_frequency",
    "custom",
  ]),
  description: z.string(),
  affectedWeeks: z.array(z.number()),
});

const DaySchema = z.object({
  id: z.number(),
  day: z.string(),
  distance: z.number().min(0.1).describe("Distance in km - must be positive"),
  "jogging-interval-time": z.number().min(1).describe("Duration of EACH jog interval in minutes (same for all intervals)"),
  "walking-intervals-time": z.number().min(0).describe("Duration of EACH walk interval in minutes (same for all, or 0 for continuous)"),
  "number-of-intervals": z.number().min(1).describe("How many times the jog/walk pattern repeats"),
  instructions: z.array(z.string()).describe("Array of helpful instructions for this run"),
});

const WeekSchema = z.object({
  id: z.number(),
  days: z.array(DaySchema),
});

const CoachResponseSchema = z.object({
  reply: z.string().describe("Your conversational response to the user"),
  responseType: z
    .enum(["chat", "evaluation", "tip", "encouragement", "modification"])
    .describe("The type of response you're giving"),
  planModification: z
    .object({
      description: z
        .string()
        .describe("A summary of the proposed changes to the plan"),
      changes: z.array(PlanChangeSchema).describe("The specific changes being made"),
      proposedWeeks: z
        .array(WeekSchema)
        .describe("The new weeks to replace existing ones from fromWeekId onwards"),
      fromWeekId: z
        .number()
        .describe("The week ID from which to start applying changes"),
    })
    .nullable()
    .describe(
      "ONLY include this when the user has EXPLICITLY confirmed they want you to modify their plan. Never include this on first mention of potential changes."
    ),
  insights: z
    .object({
      userConcerns: z
        .array(z.string())
        .optional()
        .describe("Any concerns the user has expressed"),
      physicalIssues: z
        .array(z.string())
        .optional()
        .describe("Any physical issues mentioned (soreness, injuries, etc)"),
      motivationLevel: z
        .enum(["low", "medium", "high"])
        .optional()
        .describe("Perceived motivation level based on conversation"),
    })
    .optional()
    .describe("Insights extracted from the conversation"),
});

function formatIntervals(day: DayType): string {
  const jog = day["jogging-interval-time"];
  const walk = day["walking-intervals-time"];
  const intervals = day["number-of-intervals"];

  if (walk === 0 || !walk) {
    return `${jog}min jog`;
  }

  if (intervals === 1) {
    return `${jog}min jog / ${walk}min walk`;
  }

  return `${intervals} × (${jog}min jog / ${walk}min walk)`;
}

function buildInstructions(context: CoachContext): string {
  const { goal, plan, progress, currentWeek } = context;

  const weekSummaries = calculateWeekSummaries(plan, progress);
  const recentWeeks = weekSummaries.filter(
    (w) => w.isComplete || w.weekId === currentWeek
  );

  const summaryText = recentWeeks
    .map((w) => {
      const parts = [
        `Week ${w.weekId}: ${w.completedDays}/${w.totalDays} completed`,
      ];
      if (w.missedDays > 0) parts.push(`${w.missedDays} missed`);
      if (w.averageEffort !== undefined)
        parts.push(`avg effort: ${w.averageEffort.toFixed(1)}/10`);
      if (w.averageFeeling !== undefined)
        parts.push(`avg feeling: ${w.averageFeeling.toFixed(1)}/5`);
      if (w.notes.length > 0) parts.push(`notes: "${w.notes.join("; ")}"`);
      return parts.join(", ");
    })
    .join("\n");

  // Build a summary of the current plan structure for reference
  const planStructure = plan.weeks
    .map((week) => {
      const daysSummary = week.days
        .map((day) => `${day.day}: ${day.distance}km, ${formatIntervals(day)}`)
        .join("; ");
      return `Week ${week.id}: ${daysSummary}`;
    })
    .join("\n");

  // Parse target distance to get the numeric value
  const targetDistanceKm = parseFloat(goal.distance.replace(/[^0-9.]/g, "")) || 10;

  return `You are a supportive running coach helping a user stick to their training plan.

USER'S GOAL:
- Target: ${goal.distance} (${targetDistanceKm}km)
- Timeline: ${goal.weeks} weeks
- Ability: ${goal.ability}
- Training frequency: ${goal.frequency} days/week
${goal.injuries ? `- Known injuries/conditions: ${goal.injuries}` : ""}
${goal.unavailableDays?.length ? `- Can't train on: ${goal.unavailableDays.join(", ")}` : ""}

CURRENT PLAN STRUCTURE:
${planStructure}

CURRENT PROGRESS:
- Currently on week ${currentWeek} of ${plan.weeks.length}
${summaryText ? `\nRECENT PERFORMANCE:\n${summaryText}` : ""}

YOUR CAPABILITIES:
1. EVALUATE: Summarize weekly performance based on completion rates, effort levels, and how runs felt
2. TIPS: Give specific, actionable advice based on user notes (e.g., "sore calves" → stretching/foam rolling advice)
3. ENCOURAGE: Celebrate wins, provide motivation, help users stay on track
4. MODIFY: Suggest plan adjustments when appropriate (making it easier or harder)

=== CRITICAL RULES FOR PLAN MODIFICATIONS ===

CONFIRMATION REQUIRED:
- NEVER include a planModification object unless the user has EXPLICITLY confirmed they want changes
- First, DESCRIBE what changes you would suggest and ask if they want you to make those changes
- Only after they say "yes", "do it", "make those changes", etc., include the planModification

=== WEEK COMPLETENESS REQUIREMENT - VERY IMPORTANT ===
When generating proposedWeeks, you MUST include ALL weeks from fromWeekId to week ${plan.weeks.length} (the final week).

Example: If the plan has 8 weeks and fromWeekId is 3, proposedWeeks MUST contain weeks 3, 4, 5, 6, 7, AND 8.
- Even if you're only changing week 3, you must still include weeks 4-8 unchanged
- The final week (week ${plan.weeks.length}) MUST always be included
- Missing weeks will cause the plan to be incomplete

This is MANDATORY. Do not return partial week lists.

=== WORKOUT STRUCTURE CONSTRAINT ===
Each day uses IDENTICAL repeating intervals. You CANNOT express variable or mixed patterns.

The schema requires:
- "jogging-interval-time": Duration of EACH jog interval (same for all)
- "walking-intervals-time": Duration of EACH walk interval (same for all, or 0 for continuous)
- "number-of-intervals": How many times the jog/walk pattern repeats

VALID EXAMPLES:
- 3 × (8min jog + 2min walk): jogging-interval-time: 8, walking-intervals-time: 2, number-of-intervals: 3
- Continuous 30-minute run: jogging-interval-time: 30, walking-intervals-time: 0, number-of-intervals: 1
- 5 × (5min jog + 1min walk): jogging-interval-time: 5, walking-intervals-time: 1, number-of-intervals: 5

INVALID (cannot be expressed):
- "20min jog, 2min walk, then 10min jog" ✗ (variable jog times)
- "32min jog with 2×2min walk breaks embedded" ✗ (breaks within jog)
- "warm-up, main set, cool-down" ✗ (different segment types)

If you want to suggest a workout with variable structure, approximate it with uniform intervals.
Example: Instead of "20min jog, 2min walk, 10min jog", use "2 × (15min jog + 1min walk)"

EVERY day MUST have these exact fields:
- "id": number (day number within the week, e.g., 1, 2, 3)
- "day": string (e.g., "Monday", "Wednesday", "Friday")
- "distance": number >= 0.1 (distance in km, minimum 0.1)
- "jogging-interval-time": number >= 1 (minutes per jog interval)
- "walking-intervals-time": number >= 0 (minutes per walk interval, 0 for continuous)
- "number-of-intervals": number >= 1 (how many times the pattern repeats)
- "instructions": array of strings (tips for the run)

PLAN INTEGRITY - THESE RULES ARE MANDATORY:
1. THE FINAL WEEK MUST REACH THE TARGET DISTANCE (${goal.distance} = ${targetDistanceKm}km)
   - The last week's longest run MUST be at least ${targetDistanceKm}km
   - You can adjust the path to get there, but NEVER reduce the final goal
   - If making the plan easier, spread out the progression but still end at ${targetDistanceKm}km

2. PROGRESSIVE STRUCTURE:
   - Each week should build on the previous one
   - Distances should generally increase week over week toward the goal
   - Early weeks can have more walk breaks; later weeks transition to continuous running

3. DAY STRUCTURE:
   - Keep the same training days (e.g., Monday, Wednesday, Friday)
   - Each day must have: id, day, distance, jogging-interval-time, walking-intervals-time, number-of-intervals, instructions
   - Instructions should be an array of helpful tips for that specific run

RESPONSE TYPES:
- "chat": General conversation, questions, acknowledgments
- "evaluation": When providing a weekly/performance summary
- "tip": When giving specific advice about training, recovery, technique
- "encouragement": When celebrating achievements or motivating
- "modification": When proposing or delivering plan changes

Be conversational, supportive, and specific. Reference actual data from their progress when relevant.`;
}

function createCoachAgent(context: CoachContext) {
  return new Agent({
    name: "Running Coach",
    instructions: buildInstructions(context),
    outputType: CoachResponseSchema,
  });
}

// Sanitize plan modification to ensure all values meet minimum requirements
function sanitizePlanModification(
  modification: z.infer<typeof CoachResponseSchema>["planModification"]
): z.infer<typeof CoachResponseSchema>["planModification"] {
  if (!modification) return null;

  return {
    ...modification,
    proposedWeeks: modification.proposedWeeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        distance: Math.max(0.1, day.distance || 0.1),
        "jogging-interval-time": Math.max(1, day["jogging-interval-time"] || 1),
        "walking-intervals-time": Math.max(0, day["walking-intervals-time"] || 0),
        "number-of-intervals": Math.max(1, day["number-of-intervals"] || 1),
        instructions: day.instructions || [],
      })),
    })),
  };
}

// Error message prefix for schema validation failures (detectable in client)
const SCHEMA_VALIDATION_ERROR_PREFIX = "[COACH_SCHEMA_ERROR]";

export async function processCoachConversation(
  context: CoachContext,
  userMessage: string
): Promise<CoachAgentResponse> {
  const agent = createCoachAgent(context);

  // Build conversation history
  const historyText = context.conversationHistory
    .map((msg) => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`)
    .join("\n\n");

  const prompt = historyText
    ? `${historyText}\n\nUser: ${userMessage}\n\nRespond as the Coach.`
    : `User: ${userMessage}\n\nRespond as the Coach.`;

  try {
    const result = await run(agent, prompt);

    if (result.finalOutput) {
      const output = result.finalOutput as z.infer<typeof CoachResponseSchema>;

      // Sanitize the plan modification to ensure valid values
      const sanitizedModification = sanitizePlanModification(output.planModification);

      return {
        reply: output.reply,
        responseType: output.responseType,
        planModification: sanitizedModification,
        insights: output.insights,
      };
    }

    throw new Error("Failed to get response from coach agent");
  } catch (error) {
    // Check if this is a schema validation error and wrap with identifiable prefix
    if (error instanceof Error && error.message.includes("schema validation")) {
      throw new Error(
        `${SCHEMA_VALIDATION_ERROR_PREFIX} The coach generated an invalid plan. Please try your request again.`
      );
    }
    throw error;
  }
}

export async function generateWeeklyEvaluation(
  context: CoachContext,
  weekId: number
): Promise<CoachAgentResponse> {
  const weekSummary = calculateWeekSummaries(context.plan, context.progress).find(
    (w) => w.weekId === weekId
  );

  if (!weekSummary) {
    throw new Error(`Week ${weekId} not found`);
  }

  const evaluationPrompt = `Please give me a summary evaluation of my week ${weekId} performance. I completed ${weekSummary.completedDays} out of ${weekSummary.totalDays} runs${
    weekSummary.missedDays > 0 ? ` and missed ${weekSummary.missedDays}` : ""
  }.${
    weekSummary.averageEffort !== undefined
      ? ` My average perceived effort was ${weekSummary.averageEffort.toFixed(1)}/10.`
      : ""
  }${
    weekSummary.averageFeeling !== undefined
      ? ` On average, runs felt ${weekSummary.averageFeeling.toFixed(1)}/5.`
      : ""
  }${
    weekSummary.notes.length > 0
      ? ` My notes during the week: "${weekSummary.notes.join("; ")}"`
      : ""
  }`;

  return processCoachConversation(context, evaluationPrompt);
}
