"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Plan } from "@/types/week";
import {
  CoachMessage,
  CoachContext,
  PlanModificationProposal,
} from "@/types/coach";
import {
  SavedPlanGoal,
  ProgressValue,
  getCurrentWeek,
} from "@/lib/planStorage";
import {
  getCoachMessages,
  saveCoachMessage,
  updateModificationStatus,
  addPlanModificationToMessage,
} from "@/lib/coachStorage";
import { sendCoachMessage, requestWeeklyEvaluation } from "@/app/actions/coach";
import PlanModificationCard from "./PlanModificationCard";

type Props = {
  planId: string;
  plan: Plan;
  goal: SavedPlanGoal;
  progress: Record<string, ProgressValue>;
  onClose: () => void;
  onApplyModification: (
    proposedWeeks: Plan["weeks"],
    fromWeekId: number
  ) => void;
  triggerType?: "manual" | "week_complete";
  completedWeekId?: number;
};

export default function CoachChat({
  planId,
  plan,
  goal,
  progress,
  onClose,
  onApplyModification,
  triggerType = "manual",
  completedWeekId,
}: Props) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages on mount and optionally trigger initial message
  useEffect(() => {
    const loadedMessages = getCoachMessages(planId);
    setMessages(loadedMessages);

    const shouldAutoMessage =
      loadedMessages.length === 0 ||
      (triggerType === "week_complete" && completedWeekId !== undefined);

    if (shouldAutoMessage && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      if (triggerType === "week_complete" && completedWeekId !== undefined) {
        // Auto-request week evaluation
        handleWeekEvaluation(completedWeekId, loadedMessages);
      } else if (loadedMessages.length === 0) {
        // Send initial greeting
        handleInitialGreeting();
      }
    } else {
      hasInitializedRef.current = true;
    }
  }, [planId, triggerType, completedWeekId]);

  const buildContext = (currentMessages: CoachMessage[]): CoachContext => ({
    goal,
    plan,
    progress,
    currentWeek: getCurrentWeek(plan, progress),
    conversationHistory: currentMessages,
  });

  const handleInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const context = buildContext([]);
      const currentWeek = getCurrentWeek(plan, progress);

      const response = await sendCoachMessage(
        context,
        `Hi! I just opened the coach chat. I'm currently on week ${currentWeek} of my ${goal.distance} training plan.`
      );

      const coachMessage = saveCoachMessage(planId, {
        role: "coach",
        content: response.reply,
      });

      setMessages([coachMessage]);
    } catch (error) {
      console.error("Failed to get initial greeting:", error);
      const errorMessage = saveCoachMessage(planId, {
        role: "coach",
        content:
          "Hi! I'm your running coach. How can I help you with your training today?",
      });
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeekEvaluation = async (
    weekId: number,
    currentMessages: CoachMessage[]
  ) => {
    setIsLoading(true);
    try {
      const context = buildContext(currentMessages);
      const response = await requestWeeklyEvaluation(context, weekId);

      const coachMessage = saveCoachMessage(planId, {
        role: "coach",
        content: response.reply,
      });

      setMessages((prev) => [...prev, coachMessage]);
    } catch (error) {
      console.error("Failed to get week evaluation:", error);
      const errorMessage = saveCoachMessage(planId, {
        role: "coach",
        content: `Great job completing week ${weekId}! How are you feeling about your progress?`,
      });
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = saveCoachMessage(planId, {
      role: "user",
      content: input.trim(),
    });

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const context = buildContext(updatedMessages);
      const response = await sendCoachMessage(context, userMessage.content);

      const coachMessage = saveCoachMessage(planId, {
        role: "coach",
        content: response.reply,
      });

      // If response includes a plan modification, attach it to the message
      if (response.planModification) {
        const modification = addPlanModificationToMessage(
          planId,
          coachMessage.id,
          {
            description: response.planModification.description,
            changes: response.planModification.changes,
            proposedWeeks: response.planModification.proposedWeeks,
            fromWeekId: response.planModification.fromWeekId,
          }
        );
        coachMessage.planModification = modification;
      }

      setMessages((prev) => [...prev, coachMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Check if this is a schema validation error (plan generation failed)
      const isSchemaError = error instanceof Error &&
        (error.message.includes("schema validation") ||
         error.message.includes("[COACH_SCHEMA_ERROR]"));

      const errorContent = isSchemaError
        ? "I had trouble generating a valid plan modification. Could you please try your request again? If the problem persists, try being more specific about what changes you'd like."
        : "Sorry, I had trouble responding. Please try again.";

      const errorMessage = saveCoachMessage(planId, {
        role: "coach",
        content: errorContent,
      });
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptModification = (modification: PlanModificationProposal) => {
    updateModificationStatus(planId, modification.id, "accepted");
    setMessages((prev) =>
      prev.map((msg) =>
        msg.planModification?.id === modification.id
          ? {
              ...msg,
              planModification: { ...msg.planModification, status: "accepted" },
            }
          : msg
      )
    );
    onApplyModification(modification.proposedWeeks, modification.fromWeekId);
  };

  const handleRejectModification = (modification: PlanModificationProposal) => {
    updateModificationStatus(planId, modification.id, "rejected");
    setMessages((prev) =>
      prev.map((msg) =>
        msg.planModification?.id === modification.id
          ? {
              ...msg,
              planModification: { ...msg.planModification, status: "rejected" },
            }
          : msg
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">Running Coach</h2>
              <p className="text-xs text-blue-100">Here to help you succeed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-400 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
              {msg.planModification && (
                <PlanModificationCard
                  modification={msg.planModification}
                  onAccept={() => handleAcceptModification(msg.planModification!)}
                  onReject={() => handleRejectModification(msg.planModification!)}
                />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
