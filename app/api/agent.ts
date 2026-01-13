"use server";

import { Agent, run } from "@openai/agents";
import { Plan } from "@/types/week";

import buildPrompt from "./buildPrompt";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

async function generatePlan(
  ability: string,
  weeks: number
): Promise<Plan | undefined> {
  const result = await run(agent, buildPrompt(ability, weeks));

  if (result.finalOutput) {
    console.log(result.finalOutput);
    return JSON.parse(result.finalOutput) as Plan;
  }
}

export default generatePlan;
