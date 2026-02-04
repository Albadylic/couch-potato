"use server";

import { Agent, run } from "@openai/agents";
import { Plan } from "@/types/week";
import { PlanSchema } from "@/lib/planSchema";

import buildPrompt from "../app/api/buildPrompt";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

// Error message prefix for schema validation failures (detectable in client)
const SCHEMA_VALIDATION_ERROR_PREFIX = "[PLAN_SCHEMA_ERROR]";

export type GeneratePlanResult =
  | { success: true; plan: Plan }
  | { success: false; error: string };

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  outputType: PlanSchema,
});

async function generatePlan(
  ability: string,
  weeks: number,
  frequency: number,
  distance: string,
  unavailableDays: string[],
  injuries?: string
): Promise<GeneratePlanResult> {
  try {
    const result = await run(
      agent,
      buildPrompt(ability, weeks, frequency, distance, unavailableDays, injuries)
    );

    if (result.finalOutput) {
      const plan = result.finalOutput as Plan;

      // Additional runtime check for empty weeks (belt and suspenders)
      if (!plan.weeks || plan.weeks.length === 0) {
        return {
          success: false,
          error:
            "The generated plan has no weeks. Please try again or adjust your goals.",
        };
      }

      return { success: true, plan };
    }

    return {
      success: false,
      error: "Failed to generate plan. Please try again.",
    };
  } catch (error) {
    // Check if this is a schema validation error and wrap with identifiable prefix
    if (error instanceof Error && error.message.includes("schema validation")) {
      return {
        success: false,
        error: `${SCHEMA_VALIDATION_ERROR_PREFIX} The plan generator produced an invalid plan. Please try again.`,
      };
    }

    // Re-throw unexpected errors
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export default generatePlan;
