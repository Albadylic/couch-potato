"use server";

import { processCoachConversation, generateWeeklyEvaluation } from "@/lib/coachAgent";
import { CoachContext, CoachAgentResponse } from "@/types/coach";

export async function sendCoachMessage(
  context: CoachContext,
  userMessage: string
): Promise<CoachAgentResponse> {
  return processCoachConversation(context, userMessage);
}

export async function requestWeeklyEvaluation(
  context: CoachContext,
  weekId: number
): Promise<CoachAgentResponse> {
  return generateWeeklyEvaluation(context, weekId);
}
