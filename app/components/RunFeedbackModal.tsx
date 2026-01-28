"use client";

import { useState } from "react";
import { RunFeedback, RunStatus } from "@/lib/planStorage";

type Props = {
  status: RunStatus;
  existingFeedback?: RunFeedback;
  onSave: (feedback: RunFeedback) => void;
  onClose: () => void;
};

const EFFORT_LABELS: Record<number, string> = {
  1: "Very easy",
  2: "Easy",
  3: "Light",
  4: "Moderate",
  5: "Somewhat hard",
  6: "Hard",
  7: "Very hard",
  8: "Extremely hard",
  9: "Maximum",
  10: "Absolute max",
};

const FEELING_LABELS: Record<number, string> = {
  1: "Struggled",
  2: "Tough",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export default function RunFeedbackModal({ status, existingFeedback, onSave, onClose }: Props) {
  const [perceivedEffort, setPerceivedEffort] = useState<number | undefined>(
    existingFeedback?.perceivedEffort
  );
  const [feelingRating, setFeelingRating] = useState<number | undefined>(
    existingFeedback?.feelingRating
  );
  const [notes, setNotes] = useState(existingFeedback?.notes ?? "");

  const handleSave = () => {
    const feedback: RunFeedback = {
      status,
      completedAt: existingFeedback?.completedAt ?? new Date().toISOString(),
      perceivedEffort,
      feelingRating,
      notes: notes.trim() || undefined,
    };
    onSave(feedback);
  };

  const isCompleted = status === "completed";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isCompleted ? "Run Completed" : "Run Missed"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isCompleted && (
          <>
            {/* Perceived Effort */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Perceived Effort (1-10)
              </label>
              <div className="px-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={perceivedEffort ?? 5}
                  onChange={(e) => setPerceivedEffort(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <p className="text-sm text-center mt-3">
                <span className="text-2xl font-bold text-blue-500">{perceivedEffort ?? 5}</span>
                <span className="text-gray-500 ml-2">{EFFORT_LABELS[perceivedEffort ?? 5]}</span>
              </p>
            </div>

            {/* Feeling Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                How did it feel?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFeelingRating(num)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors text-sm ${
                      feelingRating === num
                        ? num <= 2
                          ? "bg-orange-500 text-white"
                          : num === 3
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {FEELING_LABELS[num]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {isCompleted ? "Notes (optional)" : "Reason for missing (optional)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3 resize-none"
            rows={3}
            placeholder={isCompleted ? "How did the run go?" : "What happened?"}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`flex-1 py-3 rounded-lg font-medium text-white ${
              isCompleted
                ? "bg-green-500 hover:bg-green-600"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
