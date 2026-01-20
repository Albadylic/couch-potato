"use server";

import { redirect } from "next/navigation";
import generatePlan from "@/lib/agent";

export async function generatePlanAction(formData: FormData) {
  const ability = formData.get("ability") as string;
  const weeks = Number(formData.get("weeks"));
  const frequency = Number(formData.get("frequency"));

  if (!ability || !weeks || !frequency) {
    throw new Error("Invalid form data");
  }

  const plan = await generatePlan(ability, weeks, frequency);

  if (!plan) {
    throw new Error("Failed to generate plan");
  }

  // For now, pass via query params (next step will improve this)
  redirect(`/plan?ability=${ability}&weeks=${weeks}&frequency=${frequency}`);
}
