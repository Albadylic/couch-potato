"use server";

import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { Plan } from "@/types/week";
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
  distance: z.number(),
  "jogging-interval-time": z.number(),
  "walking-intervals-time": z.number(),
  "number-of-intervals": z.number(),
  instructions: z.array(z.string()),
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

function buildInstructions(context: CoachContext): string {
  const { goal, plan, progress, currentWeek, conversationHistory } = context;

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

  return `You are a supportive running coach helping a user stick to their training plan.

USER'S GOAL:
- Target: ${goal.distance}
- Timeline: ${goal.weeks} weeks
- Ability: ${goal.ability}
- Training frequency: ${goal.frequency} days/week
${goal.injuries ? `- Known injuries/conditions: ${goal.injuries}` : ""}
${goal.unavailableDays?.length ? `- Can't train on: ${goal.unavailableDays.join(", ")}` : ""}

CURRENT PROGRESS:
- Currently on week ${currentWeek} of ${plan.weeks.length}
${summaryText ? `\nRECENT PERFORMANCE:\n${summaryText}` : ""}

YOUR CAPABILITIES:
1. EVALUATE: Summarize weekly performance based on completion rates, effort levels, and how runs felt
2. TIPS: Give specific, actionable advice based on user notes (e.g., "sore calves" → stretching/foam rolling advice)
3. ENCOURAGE: Celebrate wins, provide motivation, help users stay on track
4. MODIFY: Suggest plan adjustments when appropriate (making it easier or harder)

CRITICAL RULES FOR PLAN MODIFICATIONS:
- NEVER include a planModification object unless the user has EXPLICITLY confirmed they want changes
- First, DESCRIBE what changes you would suggest and ask if they want you to make those changes
- Only after they say "yes", "do it", "make those changes", etc., include the planModification
- When modifying, generate complete replacement weeks from the specified fromWeekId onwards
- Modifications should be progressive - gradually increase/decrease intensity
- Respect the user's goal timeline when possible

RESPONSE TYPES:
- "chat": General conversation, questions, acknowledgments
- "evaluation": When providing a weekly/performance summary
- "tip": When giving specific advice about training, recovery, technique
- "encouragement": When celebrating achievements or motivating
- "modification": When proposing or delivering plan changes

When generating modified weeks, follow this structure for each day:
- Keep the same day names (e.g., "Monday", "Wednesday")
- Adjust distances, intervals, and instructions based on the modification type
- Maintain progressive overload principles (gradual increases)

Be conversational, supportive, and specific. Reference actual data from their progress when relevant.`;
}

function createCoachAgent(context: CoachContext) {
  return new Agent({
    name: "Running Coach",
    instructions: buildInstructions(context),
    outputType: CoachResponseSchema,
  });
}

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

  const result = await run(agent, prompt);

  if (result.finalOutput) {
    const output = result.finalOutput as z.infer<typeof CoachResponseSchema>;

    return {
      reply: output.reply,
      responseType: output.responseType,
      planModification: output.planModification ?? null,
      insights: output.insights,
    };
  }

  throw new Error("Failed to get response from coach agent");
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
