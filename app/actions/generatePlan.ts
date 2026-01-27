"use server";

import { redirect } from "next/navigation";

export async function generatePlanAction(formData: FormData) {
  const ability = formData.get("ability") as string;
  const weeks = Number(formData.get("weeks"));
  const frequency = Number(formData.get("frequency"));

  if (!ability || !weeks || !frequency) {
    throw new Error("Invalid form data");
  }

  redirect(`/plan?ability=${ability}&weeks=${weeks}&frequency=${frequency}`);
}
