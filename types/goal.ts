export type Tone = "encouraging" | "professional" | "brief";

export type AbilityLevel = "beginner" | "novice" | "confident";

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type Goal = {
  targetDistance?: string;
  completionWeeks?: number;
  abilityLevel?: AbilityLevel;
  // Constraint fields
  frequency?: number;            // 1-6 days per week
  unavailableDays?: DayOfWeek[]; // Days user cannot train
  injuries?: string;             // Free-form text
};

export type Message = {
  role: "user" | "agent";
  content: string;
};

export type GoalAgentResponse = {
  reply: string;
  goal: Goal;
  isComplete: boolean;
  readyForConfirmation: boolean;
};
