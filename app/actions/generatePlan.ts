"use server";

import { redirect } from "next/navigation";
import generatePlan from "@/lib/agent";

export async function generatePlanAction(formData: FormData) {
  const ability = formData.get("ability") as string;
  const weeks = Number(formData.get("weeks"));

  if (!ability || !weeks) {
    throw new Error("Invalid form data");
  }

  const plan = await generatePlan(ability, weeks);

  if (!plan) {
    throw new Error("Failed to generate plan");
  }

  // For now, pass via query params (next step will improve this)
  redirect(`/plan?ability=${ability}&weeks=${weeks}`);
}
