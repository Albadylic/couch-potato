"use server";

import { Agent, run } from "@openai/agents";
import { z } from "zod";
import { Tone, Goal, Message, GoalAgentResponse, DayOfWeek } from "@/types/goal";

const validAbilityLevels = ["beginner", "novice", "confident"] as const;
const validDaysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const GoalExtractionSchema = z.object({
  reply: z.string().describe("Your conversational response to the user"),
  goal: z.object({
    targetDistance: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined || val === "") return null;
          if (typeof val === "string" && val.toLowerCase().includes("not yet")) return null;
          return val;
        },
        z.string().nullable()
      )
      .describe("Target running distance (e.g., '5K', '10K'). Use null if not yet known."),
    completionWeeks: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined || val === "") return null;
          const num = Number(val);
          return isNaN(num) ? null : num;
        },
        z.number().nullable()
      )
      .describe("Number of weeks until goal completion. Use null if not yet known."),
    abilityLevel: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined || val === "") return null;
          if (typeof val === "string" && validAbilityLevels.includes(val as any)) {
            return val;
          }
          return null;
        },
        z.enum(["beginner", "novice", "confident"]).nullable()
      )
      .describe("User's ability level: 'beginner', 'novice', or 'confident'. Use null if not yet known."),
    frequency: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined || val === "") return null;
          const num = Number(val);
          if (isNaN(num)) return null;
          return Math.min(6, Math.max(1, num));
        },
        z.number().min(1).max(6).nullable()
      )
      .describe("Training days per week (1-6). Use null if not specified."),
    unavailableDays: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined) return null;
          if (Array.isArray(val)) {
            const validDays = val
              .map(d => typeof d === 'string' ? d.toLowerCase() : '')
              .filter(d => validDaysOfWeek.includes(d as typeof validDaysOfWeek[number]));
            return validDays.length > 0 ? validDays : null;
          }
          return null;
        },
        z.array(z.enum(validDaysOfWeek)).nullable()
      )
      .describe("Days user cannot train (e.g., ['monday']). Use null if none."),
    injuries: z
      .preprocess(
        (val) => {
          if (val === null || val === undefined || val === "") return null;
          if (typeof val === "string" && val.toLowerCase().includes("none")) return null;
          return typeof val === 'string' ? val : null;
        },
        z.string().nullable()
      )
      .describe("Health conditions or injuries. Use null if none mentioned."),
  }),
  isComplete: z.boolean().describe("Always false - confirmation is handled by the UI"),
  readyForConfirmation: z.boolean().describe("True when all required info is collected (distance, weeks, ability) AND the user has answered the constraints question (even if they said 'none')"),
});

const toneDescriptions: Record<Tone, string> = {
  encouraging:
    "Be warm, supportive, and motivating. Use phrases like 'Great goal!' and 'You've got this!' Celebrate their ambition while being helpful.",
  professional:
    "Be clear, informative, and structured. Focus on facts and practical guidance. Maintain a helpful but businesslike tone.",
  brief:
    "Be concise and direct. Minimal small talk, get to the point quickly. Short sentences, no filler.",
};

function buildInstructions(tone: Tone, currentGoal: Goal): string {
  const hasCoreGoal = currentGoal.targetDistance && currentGoal.completionWeeks && currentGoal.abilityLevel;
  const hasAskedConstraints = currentGoal.frequency !== undefined;

  return `You are a fitness coach helping users define their running goals.

TONE: ${toneDescriptions[tone]}

Your task:
1. Have a natural conversation to understand the user's running goal
2. Extract three pieces of CORE information:
   - Target distance (e.g., 5K, 10K, half marathon, marathon)
   - Completion timeframe (convert dates to weeks from now, or accept weeks directly)
   - Current ability level (beginner, novice, or confident)
3. If user provides multiple pieces of info in one message, acknowledge all of them
4. Only ask about fields that are still missing - don't re-ask for info already provided
5. For unrealistic goals, gently push back:
   - Marathon for a beginner needs at least 16-20 weeks
   - Half marathon for a beginner needs at least 10-12 weeks
   - 10K for a beginner needs at least 6-8 weeks
   - 5K for a beginner needs at least 4-6 weeks
   If their timeline is too aggressive, explain why and suggest a more achievable timeline.
6. CONSTRAINTS (ask AFTER core goal info is collected):
   Once you have distance, weeks, and ability, ask about preferences in ONE natural question:
   - "Before I create your plan, how many days per week would you like to train? (I'd suggest 3, but we can do 1-6)
     Also, are there any days you definitely can't run, or any injuries I should know about?"
   These are all OPTIONAL - if user says "no", "none", or doesn't mention them, set frequency to 3 as default.
7. When user answers the constraints question, set readyForConfirmation to true.
   DO NOT ask "does that sound right?" - the UI will show a confirmation card with buttons.
   Just give a brief acknowledgment like "Got it!" or "Perfect, let me put that together for you."

Ability level definitions:
- beginner: Never run before or very rarely, starting from scratch
- novice: Can run short distances but not consistently, some running experience
- confident: Regular runner looking to improve or tackle a new distance

IMPORTANT JSON OUTPUT RULES:
- For any goal field you don't know yet, use null (not a string like "not yet specified")
- Only include actual values when the user has clearly stated them
- isComplete should ALWAYS be false (confirmation is handled by UI buttons)
- Set readyForConfirmation to true ONLY after user has answered the constraints question

${hasCoreGoal && !hasAskedConstraints ? "IMPORTANT: Core goal is complete. NOW ask about training preferences (frequency, unavailable days, injuries) in your next message.\n" : ""}
Still needed from user:
${!currentGoal.targetDistance ? "- Target distance\n" : ""}${!currentGoal.completionWeeks ? "- Completion timeframe\n" : ""}${!currentGoal.abilityLevel ? "- Ability level\n" : ""}${hasCoreGoal && currentGoal.frequency === undefined ? "- Training preferences (frequency, unavailable days, injuries) - ask now!\n" : ""}
${currentGoal.targetDistance || currentGoal.completionWeeks || currentGoal.abilityLevel ? `\nAlready known:\n${currentGoal.targetDistance ? `- Distance: ${currentGoal.targetDistance}\n` : ""}${currentGoal.completionWeeks ? `- Weeks: ${currentGoal.completionWeeks}\n` : ""}${currentGoal.abilityLevel ? `- Ability: ${currentGoal.abilityLevel}\n` : ""}${currentGoal.frequency ? `- Frequency: ${currentGoal.frequency} days/week\n` : ""}${currentGoal.unavailableDays?.length ? `- Can't train on: ${currentGoal.unavailableDays.join(', ')}\n` : ""}${currentGoal.injuries ? `- Injuries/conditions: ${currentGoal.injuries}` : ""}` : ""}
Based on the conversation history, continue the dialogue naturally.`;
}

function createGoalAgent(tone: Tone, currentGoal: Goal) {
  return new Agent({
    name: "Goal Coach",
    instructions: buildInstructions(tone, currentGoal),
    outputType: GoalExtractionSchema,
  });
}

export async function processGoalConversation(
  messages: Message[],
  tone: Tone,
  currentGoal: Goal
): Promise<GoalAgentResponse> {
  const agent = createGoalAgent(tone, currentGoal);

  // Convert messages to a single prompt with conversation history
  const conversationHistory = messages
    .map((msg) => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`)
    .join("\n\n");

  const prompt = `Conversation so far:\n\n${conversationHistory}\n\nRespond as the Coach.`;

  const result = await run(agent, prompt);

  if (result.finalOutput) {
    const output = result.finalOutput as z.infer<typeof GoalExtractionSchema>;

    // Merge newly extracted goal fields with existing ones
    const mergedGoal: Goal = {
      targetDistance: output.goal.targetDistance ?? currentGoal.targetDistance,
      completionWeeks: output.goal.completionWeeks ?? currentGoal.completionWeeks,
      abilityLevel: output.goal.abilityLevel ?? currentGoal.abilityLevel,
      frequency: output.goal.frequency ?? currentGoal.frequency,
      unavailableDays: output.goal.unavailableDays ?? currentGoal.unavailableDays,
      injuries: output.goal.injuries ?? currentGoal.injuries,
    };

    return {
      reply: output.reply,
      goal: mergedGoal,
      isComplete: output.isComplete,
      readyForConfirmation: output.readyForConfirmation,
    };
  }

  throw new Error("Failed to get response from goal agent");
}
