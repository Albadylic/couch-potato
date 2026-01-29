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
import LoadingPotato from "@/app/components/LoadingPotato";
import { PotatoFlexing, PotatoMascot } from "@/app/components/PotatoMascot";

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
        <LoadingPotato message="Loading your plan..." />
      </main>
    );
  }

  if (!savedPlan) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4 text-center">
        <PotatoMascot size={100} className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4 text-stone-dark">Plan Not Found</h1>
        <p className="text-stone mb-6">This plan doesn&apos;t exist or may have been deleted.</p>
        <Link
          href="/plans"
          className="btn-primary inline-block"
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
        <div className="mb-6 bg-success-light border-2 border-sage rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PotatoFlexing size={50} />
            <div>
              <p className="font-medium text-stone-dark">
                Week {completedWeekId} Complete!
              </p>
              <p className="text-sm text-stone">
                Would you like Coach Spud to evaluate your performance?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenEvaluation}
              className="px-4 py-2 bg-sage-dark text-white text-sm font-medium rounded-full hover:bg-sage transition-colors"
            >
              Get Evaluation
            </button>
            <button
              onClick={handleDismissPrompt}
              className="px-4 py-2 text-stone text-sm font-medium hover:bg-stone-light rounded-full transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-dark">
          {savedPlan.goal.distance} in {savedPlan.goal.weeks} weeks
        </h1>
        <Link
          href="/plans"
          className="text-sm text-stone hover:text-stone-dark transition-colors"
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
