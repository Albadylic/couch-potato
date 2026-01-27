import { Plan } from "@/types/week";

export type SavedPlanGoal = {
  distance: string;
  weeks: number;
  ability: string;
  frequency: number;
  unavailableDays?: string[];
  injuries?: string;
};

export type SavedPlan = {
  id: string;
  createdAt: string;
  goal: SavedPlanGoal;
  plan: Plan;
  progress: Record<string, boolean>; // "week1-day2": true
};

const STORAGE_KEY = "saved-plans";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getProgressKey(weekId: number, dayId: number): string {
  return `week${weekId}-day${dayId}`;
}

export function getAllPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data) as SavedPlan[];
  } catch {
    return [];
  }
}

export function getPlanById(id: string): SavedPlan | null {
  const plans = getAllPlans();
  return plans.find((p) => p.id === id) ?? null;
}

export function savePlan(goal: SavedPlanGoal, plan: Plan): string {
  const plans = getAllPlans();

  const newPlan: SavedPlan = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    goal,
    plan,
    progress: {},
  };

  plans.push(newPlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

  return newPlan.id;
}

export function updatePlanProgress(
  planId: string,
  weekId: number,
  dayId: number,
  completed: boolean
): void {
  const plans = getAllPlans();
  const planIndex = plans.findIndex((p) => p.id === planId);

  if (planIndex === -1) return;

  const key = getProgressKey(weekId, dayId);
  plans[planIndex].progress[key] = completed;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlan(id: string): void {
  const plans = getAllPlans();
  const filtered = plans.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getPlanProgress(plan: SavedPlan): { completed: number; total: number } {
  let total = 0;
  let completed = 0;

  for (const week of plan.plan.weeks) {
    for (const day of week.days) {
      total++;
      const key = getProgressKey(week.id, day.id);
      if (plan.progress[key]) {
        completed++;
      }
    }
  }

  return { completed, total };
}
