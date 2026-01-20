"use server";

import { prisma } from "@/lib/prisma";
import { Plan } from "@/types/week";

export async function savePlanAction(plan: Plan) {
  // Optional: validate the plan here
  //   if (!plan.ability || !plan.weeks || !plan.frequency) {
  //     throw new Error("Invalid plan data");
  //   }

  const savedPlan = await prisma.plan.create({
    data: {
      weeks: plan.weeks,
    },
  });

  return savedPlan;
}
