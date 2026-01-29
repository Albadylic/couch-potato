import { Plan } from "@/types/week";

export type SavedPlanGoal = {
  distance: string;
  weeks: number;
  ability: string;
  frequency: number;
  unavailableDays?: string[];
  injuries?: string;
};

export type RunStatus = 'completed' | 'missed';

export type RunFeedback = {
  status: RunStatus;
  completedAt: string;              // ISO timestamp
  perceivedEffort?: number;         // 1-10 scale
  feelingRating?: number;           // 1-5 (1=tough, 5=easy)
  notes?: string;                   // Free text
};

// Support both old boolean format and new RunFeedback format
export type ProgressValue = boolean | RunFeedback;

export type SavedPlan = {
  id: string;
  createdAt: string;
  goal: SavedPlanGoal;
  plan: Plan;
  progress: Record<string, ProgressValue>;
};

// Helper to normalize progress value to RunFeedback or null
export function normalizeProgress(value: ProgressValue | undefined): RunFeedback | null {
  if (!value) return null;
  if (typeof value === 'boolean') {
    // Migrate old boolean format
    return value ? { status: 'completed', completedAt: new Date().toISOString() } : null;
  }
  return value;
}

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
  feedback: RunFeedback
): void {
  const plans = getAllPlans();
  const planIndex = plans.findIndex((p) => p.id === planId);

  if (planIndex === -1) return;

  const key = getProgressKey(weekId, dayId);
  plans[planIndex].progress[key] = feedback;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function clearDayProgress(
  planId: string,
  weekId: number,
  dayId: number
): void {
  const plans = getAllPlans();
  const planIndex = plans.findIndex((p) => p.id === planId);

  if (planIndex === -1) return;

  const key = getProgressKey(weekId, dayId);
  delete plans[planIndex].progress[key];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function deletePlan(id: string): void {
  const plans = getAllPlans();
  const filtered = plans.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getPlanProgress(plan: SavedPlan): { completed: number; missed: number; total: number } {
  let total = 0;
  let completed = 0;
  let missed = 0;

  for (const week of plan.plan.weeks) {
    for (const day of week.days) {
      total++;
      const key = getProgressKey(week.id, day.id);
      const progress = normalizeProgress(plan.progress[key]);
      if (progress?.status === 'completed') {
        completed++;
      } else if (progress?.status === 'missed') {
        missed++;
      }
    }
  }

  return { completed, missed, total };
}

export type WeekCompletionStatus = {
  isComplete: boolean;
  isLastDayJustCompleted: boolean;
  completedDays: number;
  totalDays: number;
};

export function getWeekCompletionStatus(
  plan: Plan,
  progress: Record<string, ProgressValue>,
  weekId: number
): WeekCompletionStatus {
  const week = plan.weeks.find((w) => w.id === weekId);
  if (!week) {
    return { isComplete: false, isLastDayJustCompleted: false, completedDays: 0, totalDays: 0 };
  }

  const totalDays = week.days.length;
  let completedDays = 0;
  let lastDayHasStatus = false;

  for (const day of week.days) {
    const key = getProgressKey(week.id, day.id);
    const dayProgress = normalizeProgress(progress[key]);
    if (dayProgress) {
      completedDays++;
      if (day.id === week.days[week.days.length - 1].id) {
        lastDayHasStatus = true;
      }
    }
  }

  const isComplete = completedDays === totalDays;

  return {
    isComplete,
    isLastDayJustCompleted: isComplete && lastDayHasStatus,
    completedDays,
    totalDays,
  };
}

export function getCurrentWeek(plan: Plan, progress: Record<string, ProgressValue>): number {
  for (const week of plan.weeks) {
    const status = getWeekCompletionStatus(plan, progress, week.id);
    if (!status.isComplete) {
      return week.id;
    }
  }
  // All weeks complete, return the last week
  return plan.weeks[plan.weeks.length - 1]?.id ?? 1;
}

export function updatePlanWeeks(
  planId: string,
  newWeeks: Plan["weeks"],
  fromWeekId: number
): void {
  const plans = getAllPlans();
  const planIndex = plans.findIndex((p) => p.id === planId);

  if (planIndex === -1) return;

  const existingWeeks = plans[planIndex].plan.weeks;

  // Keep weeks before fromWeekId, replace with newWeeks from that point
  const updatedWeeks = [
    ...existingWeeks.filter((w) => w.id < fromWeekId),
    ...newWeeks,
  ];

  plans[planIndex].plan.weeks = updatedWeeks;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}
