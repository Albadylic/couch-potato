import { CoachMessage, PlanModificationProposal } from "@/types/coach";

const STORAGE_KEY_PREFIX = "coach-messages-";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getStorageKey(planId: string): string {
  return `${STORAGE_KEY_PREFIX}${planId}`;
}

export function getCoachMessages(planId: string): CoachMessage[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(getStorageKey(planId));
  if (!data) return [];

  try {
    return JSON.parse(data) as CoachMessage[];
  } catch {
    return [];
  }
}

export function saveCoachMessage(
  planId: string,
  message: Omit<CoachMessage, "id" | "timestamp">
): CoachMessage {
  const messages = getCoachMessages(planId);

  const newMessage: CoachMessage = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...message,
  };

  messages.push(newMessage);
  localStorage.setItem(getStorageKey(planId), JSON.stringify(messages));

  return newMessage;
}

export function updateModificationStatus(
  planId: string,
  modificationId: string,
  status: "accepted" | "rejected"
): void {
  const messages = getCoachMessages(planId);

  const updatedMessages = messages.map((msg) => {
    if (msg.planModification?.id === modificationId) {
      return {
        ...msg,
        planModification: {
          ...msg.planModification,
          status,
        },
      };
    }
    return msg;
  });

  localStorage.setItem(getStorageKey(planId), JSON.stringify(updatedMessages));
}

export function addPlanModificationToMessage(
  planId: string,
  messageId: string,
  modification: Omit<PlanModificationProposal, "id" | "status">
): PlanModificationProposal {
  const messages = getCoachMessages(planId);

  const modificationWithId: PlanModificationProposal = {
    id: generateId(),
    status: "pending",
    ...modification,
  };

  const updatedMessages = messages.map((msg) => {
    if (msg.id === messageId) {
      return {
        ...msg,
        planModification: modificationWithId,
      };
    }
    return msg;
  });

  localStorage.setItem(getStorageKey(planId), JSON.stringify(updatedMessages));
  return modificationWithId;
}

export function clearCoachMessages(planId: string): void {
  localStorage.removeItem(getStorageKey(planId));
}
