import { Plan } from "@/types/week";
import { WeekSummary } from "@/types/coach";
import { ProgressValue, normalizeProgress, getProgressKey } from "@/lib/planStorage";

export function calculateWeekSummaries(
  plan: Plan,
  progress: Record<string, ProgressValue>
): WeekSummary[] {
  return plan.weeks.map((week) => {
    const totalDays = week.days.length;
    let completedDays = 0;
    let missedDays = 0;
    let totalEffort = 0;
    let effortCount = 0;
    let totalFeeling = 0;
    let feelingCount = 0;
    const notes: string[] = [];

    for (const day of week.days) {
      const key = getProgressKey(week.id, day.id);
      const dayProgress = normalizeProgress(progress[key]);

      if (dayProgress) {
        if (dayProgress.status === "completed") {
          completedDays++;
          if (dayProgress.perceivedEffort !== undefined) {
            totalEffort += dayProgress.perceivedEffort;
            effortCount++;
          }
          if (dayProgress.feelingRating !== undefined) {
            totalFeeling += dayProgress.feelingRating;
            feelingCount++;
          }
        } else if (dayProgress.status === "missed") {
          missedDays++;
        }
        if (dayProgress.notes) {
          notes.push(dayProgress.notes);
        }
      }
    }

    const isComplete = completedDays + missedDays === totalDays;

    return {
      weekId: week.id,
      totalDays,
      completedDays,
      missedDays,
      averageEffort: effortCount > 0 ? totalEffort / effortCount : undefined,
      averageFeeling: feelingCount > 0 ? totalFeeling / feelingCount : undefined,
      notes,
      isComplete,
    };
  });
}
