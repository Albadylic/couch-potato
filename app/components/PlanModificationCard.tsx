"use client";

import { useState } from "react";
import { PlanModificationProposal } from "@/types/coach";

type Props = {
  modification: PlanModificationProposal;
  onAccept: () => void;
  onReject: () => void;
};

export default function PlanModificationCard({
  modification,
  onAccept,
  onReject,
}: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const isPending = modification.status === "pending";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-blue-900">Plan Modification</h4>
          <p className="text-sm text-blue-700 mt-1">{modification.description}</p>

          {modification.changes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {modification.changes.map((change, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-600 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {change.description}
                </li>
              ))}
            </ul>
          )}

          {modification.proposedWeeks.length > 0 && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  showPreview ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {showPreview ? "Hide" : "Preview"} proposed weeks
            </button>
          )}

          {showPreview && (
            <div className="mt-3 bg-white rounded border border-blue-200 p-3 max-h-60 overflow-y-auto">
              {modification.proposedWeeks.map((week) => (
                <div key={week.id} className="mb-3 last:mb-0">
                  <h5 className="font-medium text-sm text-gray-900">
                    Week {week.id}
                  </h5>
                  <div className="mt-1 space-y-1">
                    {week.days.map((day) => (
                      <div
                        key={day.id}
                        className="text-xs text-gray-600 flex items-center gap-2"
                      >
                        <span className="font-medium w-20">{day.day}</span>
                        <span>{day.distance}km</span>
                        <span className="text-gray-400">|</span>
                        <span>
                          {day["number-of-intervals"]}x{" "}
                          {day["jogging-interval-time"]}min jog /{" "}
                          {day["walking-intervals-time"]}min walk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isPending && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onAccept}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Apply Changes
              </button>
              <button
                onClick={onReject}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          )}

          {modification.status === "accepted" && (
            <div className="mt-3 py-2 px-3 bg-green-100 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Changes applied
            </div>
          )}

          {modification.status === "rejected" && (
            <div className="mt-3 py-2 px-3 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Changes rejected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
