"use client";

import { useState } from "react";
import { PlanModificationProposal } from "@/types/coach";
import { DayType } from "@/types/week";
import { PotatoFlexing } from "./PotatoMascot";

type Props = {
  modification: PlanModificationProposal;
  onAccept: () => void;
  onReject: () => void;
};

function formatIntervals(day: DayType): string {
  const jog = day["jogging-interval-time"];
  const walk = day["walking-intervals-time"];
  const intervals = day["number-of-intervals"];

  if (walk === 0 || !walk) {
    return `${jog}min jog`;
  }

  if (intervals === 1) {
    return `${jog}min jog / ${walk}min walk`;
  }

  return `${intervals} × (${jog}min jog / ${walk}min walk)`;
}

export default function PlanModificationCard({
  modification,
  onAccept,
  onReject,
}: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const isPending = modification.status === "pending";

  return (
    <div className="bg-potato-body/30 border-2 border-potato-body rounded-xl p-4 my-3 ml-8">
      <div className="flex items-start gap-3">
        <PotatoFlexing size={40} className="flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-stone-dark">Plan Update</h4>
          <p className="text-sm text-stone mt-1">{modification.description}</p>

          {modification.changes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {modification.changes.map((change, index) => (
                <li
                  key={index}
                  className="text-sm text-stone-dark flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-sage rounded-full" />
                  {change.description}
                </li>
              ))}
            </ul>
          )}

          {modification.proposedWeeks.length > 0 && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-stone-dark hover:text-stone mt-2 flex items-center gap-1"
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
            <div className="mt-3 bg-white rounded-xl border border-stone-light p-3 max-h-60 overflow-y-auto">
              {modification.proposedWeeks.map((week) => (
                <div key={week.id} className="mb-3 last:mb-0">
                  <h5 className="font-medium text-sm text-stone-dark">
                    Week {week.id}
                  </h5>
                  <div className="mt-1 space-y-1">
                    {week.days.map((day) => (
                      <div
                        key={day.id}
                        className="text-xs text-stone flex items-center gap-2"
                      >
                        <span className="font-medium w-20 text-stone-dark">{day.day}</span>
                        <span>{day.distance}km</span>
                        <span className="text-stone-light">|</span>
                        <span>{formatIntervals(day)}</span>
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
                className="flex-1 py-2 px-4 bg-sage-dark hover:bg-sage text-white text-sm font-medium rounded-full transition-colors"
              >
                Apply Changes
              </button>
              <button
                onClick={onReject}
                className="flex-1 py-2 px-4 bg-cream-dark hover:bg-stone-light text-stone-dark text-sm font-medium rounded-full border border-stone-light transition-colors"
              >
                Reject
              </button>
            </div>
          )}

          {modification.status === "accepted" && (
            <div className="mt-3 py-2 px-3 bg-success-light text-sage-dark text-sm rounded-full flex items-center gap-2">
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
            <div className="mt-3 py-2 px-3 bg-cream-dark text-stone text-sm rounded-full flex items-center gap-2">
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
