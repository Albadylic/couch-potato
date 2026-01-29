"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getPlanById,
  SavedPlan,
  getWeekCompletionStatus,
  updatePlanWeeks,
} from "@/lib/planStorage";
import { Plan } from "@/types/week";
import PlanViewerWithStorage from "@/app/components/PlanViewerWithStorage";
import CoachChatButton from "@/app/components/CoachChatButton";
import CoachChat from "@/app/components/CoachChat";

export default function SavedPlanPage() {
  const params = useParams();
  const id = params.id as string;
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Coach chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTrigger, setChatTrigger] = useState<"manual" | "week_complete">("manual");
  const [completedWeekId, setCompletedWeekId] = useState<number | undefined>();
  const [showEvaluationPrompt, setShowEvaluationPrompt] = useState(false);
  const [lastCompletedWeek, setLastCompletedWeek] = useState<number | null>(null);

  useEffect(() => {
    const plan = getPlanById(id);
    setSavedPlan(plan);
    setLoading(false);
  }, [id]);

  // Detect week completion when progress updates
  const handleProgressUpdate = useCallback(
    (weekId: number, dayId: number) => {
      if (!savedPlan) return;

      // Re-fetch to get latest progress
      const updatedPlan = getPlanById(id);
      if (!updatedPlan) return;

      setSavedPlan(updatedPlan);

      const status = getWeekCompletionStatus(
        updatedPlan.plan,
        updatedPlan.progress,
        weekId
      );

      // Show evaluation prompt if we just completed a week
      if (status.isComplete && lastCompletedWeek !== weekId) {
        setLastCompletedWeek(weekId);
        setCompletedWeekId(weekId);
        setShowEvaluationPrompt(true);
      }
    },
    [savedPlan, id, lastCompletedWeek]
  );

  const handleOpenEvaluation = () => {
    setShowEvaluationPrompt(false);
    setChatTrigger("week_complete");
    setChatOpen(true);
  };

  const handleDismissPrompt = () => {
    setShowEvaluationPrompt(false);
  };

  const handleOpenChat = () => {
    setChatTrigger("manual");
    setCompletedWeekId(undefined);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setChatTrigger("manual");
    setCompletedWeekId(undefined);
  };

  const handleApplyModification = (
    proposedWeeks: Plan["weeks"],
    fromWeekId: number
  ) => {
    updatePlanWeeks(id, proposedWeeks, fromWeekId);
    // Refresh the plan from storage
    const updatedPlan = getPlanById(id);
    if (updatedPlan) {
      setSavedPlan(updatedPlan);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4">
        <p className="text-center">Loading plan...</p>
      </main>
    );
  }

  if (!savedPlan) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
        <p className="text-gray-600 mb-6">This plan doesn&apos;t exist or may have been deleted.</p>
        <Link
          href="/plans"
          className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          View All Plans
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      {/* Week Completion Evaluation Prompt */}
      {showEvaluationPrompt && completedWeekId !== undefined && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">
                Week {completedWeekId} Complete!
              </p>
              <p className="text-sm text-blue-700">
                Would you like your coach to evaluate your performance?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenEvaluation}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Evaluation
            </button>
            <button
              onClick={handleDismissPrompt}
              className="px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-100 rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {savedPlan.goal.distance} in {savedPlan.goal.weeks} weeks
        </h1>
        <Link
          href="/plans"
          className="text-sm text-gray-500 hover:text-black"
        >
          All Plans
        </Link>
      </div>

      <PlanViewerWithStorage
        plan={savedPlan.plan}
        goal={savedPlan.goal}
        existingPlanId={savedPlan.id}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Coach Chat Button */}
      <CoachChatButton onClick={handleOpenChat} />

      {/* Coach Chat Modal */}
      {chatOpen && (
        <CoachChat
          planId={savedPlan.id}
          plan={savedPlan.plan}
          goal={savedPlan.goal}
          progress={savedPlan.progress}
          onClose={handleCloseChat}
          onApplyModification={handleApplyModification}
          triggerType={chatTrigger}
          completedWeekId={completedWeekId}
        />
      )}
    </main>
  );
}
