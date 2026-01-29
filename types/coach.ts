import { Plan, WeekType } from "./week";
import { SavedPlanGoal, ProgressValue } from "@/lib/planStorage";

export type CoachMessage = {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
  planModification?: PlanModificationProposal;
};

export type PlanModificationProposal = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  description: string;
  changes: PlanChange[];
  proposedWeeks: WeekType[];
  fromWeekId: number;
};

export type PlanChangeType =
  | "increase_intensity"
  | "decrease_intensity"
  | "add_rest_day"
  | "extend_timeline"
  | "shorten_timeline"
  | "adjust_frequency"
  | "custom";

export type PlanChange = {
  type: PlanChangeType;
  description: string;
  affectedWeeks: number[];
};

export type CoachContext = {
  goal: SavedPlanGoal;
  plan: Plan;
  progress: Record<string, ProgressValue>;
  currentWeek: number;
  conversationHistory: CoachMessage[];
};

export type CoachAgentResponse = {
  reply: string;
  responseType: "chat" | "evaluation" | "tip" | "encouragement" | "modification";
  planModification?: {
    description: string;
    changes: PlanChange[];
    proposedWeeks: WeekType[];
    fromWeekId: number;
  } | null;
  insights?: {
    userConcerns?: string[];
    physicalIssues?: string[];
    motivationLevel?: "low" | "medium" | "high";
  };
};

export type WeekSummary = {
  weekId: number;
  totalDays: number;
  completedDays: number;
  missedDays: number;
  averageEffort?: number;
  averageFeeling?: number;
  notes: string[];
  isComplete: boolean;
};
