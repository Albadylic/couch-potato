"use server";

import { processGoalConversation } from "@/lib/goalAgent";
import { Tone, Goal, Message, GoalAgentResponse } from "@/types/goal";

export async function continueGoalConversation(
  messages: Message[],
  tone: Tone,
  currentGoal: Goal
): Promise<GoalAgentResponse> {
  return processGoalConversation(messages, tone, currentGoal);
}
