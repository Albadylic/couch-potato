export async function continueGoalConversation(
  messages: { role: "user" | "agent"; content: string }[]
) {
  /**
   * 1. Send messages to AI agent
   * 2. Ask it to:
   *    - Ask the next best question
   *    - Extract structured goal data so far
   */

  return {
    reply: "Great. How much time per week can you realistically commit?",
    goal: {
      area: "health",
      outcome: "Run a 5K",
    },
    isComplete: false,
  };
}
