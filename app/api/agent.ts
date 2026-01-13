"use server";

import { Agent, OpenAIResponsesModel, run } from "@openai/agents";
// import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const agent = new Agent({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
  // model: new OpenAIResponsesModel(
  //   new OpenAI({
  //     apiKey: process.env.OPENAI_API_KEY,
  //   }),
  //   "gpt-4.1-mini"
  // ),
});

async function generatePlan(
  ability: string,
  weeks: number
): Promise<string | undefined> {
  const result = await run(
    agent,
    `Generate a couch to 5K plan for a ${ability} runner in ${weeks} weeks`
  );

  return result.finalOutput;
}

export default generatePlan;
