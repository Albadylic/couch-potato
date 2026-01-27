"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/types/week";
import { SavedPlanGoal, savePlan, getPlanById, updatePlanProgress, getProgressKey } from "@/lib/planStorage";
import PlanViewer from "./PlanViewer";

type Props = {
  plan: Plan;
  goal: SavedPlanGoal;
  existingPlanId?: string;
};

export default function PlanViewerWithStorage({ plan, goal, existingPlanId }: Props) {
  const router = useRouter();
  const [planId, setPlanId] = useState<string | null>(existingPlanId ?? null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(!existingPlanId);
  const hasSaved = useRef(false);

  useEffect(() => {
    if (existingPlanId) {
      // Load existing plan progress
      const savedPlan = getPlanById(existingPlanId);
      if (savedPlan) {
        setProgress(savedPlan.progress);
      }
      setIsLoading(false);
    } else if (!hasSaved.current) {
      // Save new plan and redirect to its URL (only once)
      hasSaved.current = true;
      const id = savePlan(goal, plan);
      setPlanId(id);
      router.replace(`/plan/${id}`);
    }
  }, [existingPlanId, goal, plan, router]);

  const handleToggleComplete = (weekId: number, dayId: number) => {
    const id = planId ?? existingPlanId;
    if (!id) return;

    const key = getProgressKey(weekId, dayId);
    const newValue = !progress[key];

    setProgress((prev) => ({ ...prev, [key]: newValue }));
    updatePlanProgress(id, weekId, dayId, newValue);
  };

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <PlanViewer
      plan={plan}
      progress={progress}
      onToggleComplete={handleToggleComplete}
    />
  );
}
