"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Plan, WeekType, DayType } from "@/types/week";
import {
  getProgressKey,
  ProgressValue,
  RunFeedback,
  RunStatus,
  normalizeProgress,
} from "@/lib/planStorage";
import RunFeedbackModal from "./RunFeedbackModal";

type ViewType = "full" | "weekly" | "daily";

type SelectedDay = {
  day: DayType;
  weekId: number;
} | null;

type FeedbackModalState = {
  weekId: number;
  dayId: number;
  status: RunStatus;
  existingFeedback?: RunFeedback;
} | null;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type PlanViewerProps = {
  plan: Plan;
  progress?: Record<string, ProgressValue>;
  onUpdateFeedback?: (
    weekId: number,
    dayId: number,
    feedback: RunFeedback,
  ) => void;
};

export default function PlanViewer({
  plan,
  progress = {},
  onUpdateFeedback,
}: PlanViewerProps) {
  // Guard against empty plans
  if (!plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 mb-4 rounded-full bg-gray-100">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-stone-dark mb-2 font-medium">No plan available</p>
        <p className="text-stone text-sm">
          Your training plan appears to be empty.
        </p>
      </div>
    );
  }

  const [view, setView] = useState<ViewType>("weekly");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [showWeekMenu, setShowWeekMenu] = useState(false);
  const [showDayMenu, setShowDayMenu] = useState(false);
  const [modalDay, setModalDay] = useState<SelectedDay>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(null);
  const [rememberedDay, setRememberedDay] = useState<{
    dayIndex: number;
    weekIndex: number;
  } | null>(null);
  const dayMenuRef = useRef<HTMLDivElement>(null);
  const currentDayButtonRef = useRef<HTMLButtonElement>(null);
  const fullViewRef = useRef<{ scrollToDay: (dayIndex: number) => void }>(null);

  const totalWeeks = plan.weeks.length;
  const allDays = plan.weeks.flatMap((week, weekIndex) =>
    week.days.map((day) => ({ ...day, weekIndex, weekId: week.id })),
  );
  const totalDays = allDays.length;

  // Scroll day dropdown to current day when opened
  useEffect(() => {
    if (showDayMenu && currentDayButtonRef.current && dayMenuRef.current) {
      const button = currentDayButtonRef.current;
      const menu = dayMenuRef.current;
      const buttonTop = button.offsetTop;
      const menuHeight = menu.clientHeight;
      const buttonHeight = button.clientHeight;
      menu.scrollTop = buttonTop - menuHeight / 2 + buttonHeight / 2;
    }
  }, [showDayMenu]);

  // Handle view switching with synchronization
  const handleViewChange = (newView: ViewType) => {
    if (newView === view) return;

    if (view === "daily" && newView === "weekly") {
      setRememberedDay({
        dayIndex: currentDay,
        weekIndex: allDays[currentDay].weekIndex,
      });
      setCurrentWeek(allDays[currentDay].weekIndex);
    } else if (view === "daily" && newView === "full") {
      setRememberedDay({
        dayIndex: currentDay,
        weekIndex: allDays[currentDay].weekIndex,
      });
      setTimeout(() => {
        fullViewRef.current?.scrollToDay(currentDay);
      }, 0);
    } else if (view === "weekly" && newView === "daily") {
      if (rememberedDay && rememberedDay.weekIndex === currentWeek) {
        setCurrentDay(rememberedDay.dayIndex);
      } else {
        const firstDayOfWeek = allDays.findIndex(
          (d) => d.weekIndex === currentWeek,
        );
        if (firstDayOfWeek !== -1) {
          setCurrentDay(firstDayOfWeek);
        }
      }
    } else if (view === "weekly" && newView === "full") {
      const firstDayOfWeek = allDays.findIndex(
        (d) => d.weekIndex === currentWeek,
      );
      setTimeout(() => {
        fullViewRef.current?.scrollToDay(
          firstDayOfWeek !== -1 ? firstDayOfWeek : 0,
        );
      }, 0);
    }

    setView(newView);
  };

  const handleStatusClick = (
    weekId: number,
    dayId: number,
    status: RunStatus,
  ) => {
    const key = getProgressKey(weekId, dayId);
    const existing = normalizeProgress(progress[key]);

    // Open feedback modal
    setFeedbackModal({
      weekId,
      dayId,
      status,
      existingFeedback: existing ?? undefined,
    });
  };

  const handleFeedbackSave = (feedback: RunFeedback) => {
    if (feedbackModal && onUpdateFeedback) {
      onUpdateFeedback(feedbackModal.weekId, feedbackModal.dayId, feedback);
    }
    setFeedbackModal(null);
  };

  const handleOpenFeedback = (weekId: number, dayId: number) => {
    const key = getProgressKey(weekId, dayId);
    const existing = normalizeProgress(progress[key]);
    if (existing) {
      setFeedbackModal({
        weekId,
        dayId,
        status: existing.status,
        existingFeedback: existing,
      });
    }
  };

  return (
    <div>
      {/* View Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => handleViewChange("full")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "full"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Full
          </button>
          <button
            onClick={() => handleViewChange("weekly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "weekly"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => handleViewChange("daily")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "daily"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Navigation for Weekly/Daily views */}
      {view !== "full" && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => {
              if (view === "weekly") {
                setCurrentWeek((prev) => Math.max(0, prev - 1));
              } else {
                setCurrentDay((prev) => Math.max(0, prev - 1));
              }
            }}
            disabled={view === "weekly" ? currentWeek === 0 : currentDay === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                if (view === "weekly") {
                  setShowWeekMenu(!showWeekMenu);
                  setShowDayMenu(false);
                } else {
                  setShowDayMenu(!showDayMenu);
                  setShowWeekMenu(false);
                }
              }}
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
            >
              {view === "weekly"
                ? `Week ${currentWeek + 1} of ${totalWeeks}`
                : `Day ${currentDay + 1} of ${totalDays}`}
            </button>

            {showWeekMenu && view === "weekly" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 max-h-48 overflow-y-auto">
                {plan.weeks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentWeek(index);
                      setShowWeekMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      index === currentWeek ? "bg-gray-50 font-medium" : ""
                    }`}
                  >
                    Week {index + 1}
                  </button>
                ))}
              </div>
            )}

            {showDayMenu && view === "daily" && (
              <div
                ref={dayMenuRef}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 max-h-48 overflow-y-auto"
              >
                {allDays.map((day, index) => (
                  <button
                    key={index}
                    ref={index === currentDay ? currentDayButtonRef : null}
                    onClick={() => {
                      setCurrentDay(index);
                      setShowDayMenu(false);
                    }}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      index === currentDay ? "bg-gray-50 font-medium" : ""
                    }`}
                  >
                    Week {day.weekId}, {day.day}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (view === "weekly") {
                setCurrentWeek((prev) => Math.min(totalWeeks - 1, prev + 1));
              } else {
                setCurrentDay((prev) => Math.min(totalDays - 1, prev + 1));
              }
            }}
            disabled={
              view === "weekly"
                ? currentWeek === totalWeeks - 1
                : currentDay === totalDays - 1
            }
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* View Content */}
      {view === "full" && (
        <FullView
          ref={fullViewRef}
          plan={plan}
          progress={progress}
          onDayClick={(day, weekId) => setModalDay({ day, weekId })}
          onStatusClick={handleStatusClick}
          onOpenFeedback={handleOpenFeedback}
        />
      )}
      {view === "weekly" && (
        <WeeklyView
          week={plan.weeks[currentWeek]}
          progress={progress}
          onDayClick={(day) =>
            setModalDay({ day, weekId: plan.weeks[currentWeek].id })
          }
          onStatusClick={handleStatusClick}
          onOpenFeedback={handleOpenFeedback}
        />
      )}
      {view === "daily" && (
        <DailyView
          day={allDays[currentDay]}
          weekId={allDays[currentDay].weekId}
          feedback={normalizeProgress(
            progress[
              getProgressKey(allDays[currentDay].weekId, allDays[currentDay].id)
            ],
          )}
          onStatusClick={(status) =>
            handleStatusClick(
              allDays[currentDay].weekId,
              allDays[currentDay].id,
              status,
            )
          }
          onOpenFeedback={() =>
            handleOpenFeedback(
              allDays[currentDay].weekId,
              allDays[currentDay].id,
            )
          }
        />
      )}

      {/* Day Detail Modal */}
      {modalDay && (
        <DayModal
          day={modalDay.day}
          weekId={modalDay.weekId}
          feedback={normalizeProgress(
            progress[getProgressKey(modalDay.weekId, modalDay.day.id)],
          )}
          onStatusClick={(status) =>
            handleStatusClick(modalDay.weekId, modalDay.day.id, status)
          }
          onOpenFeedback={() =>
            handleOpenFeedback(modalDay.weekId, modalDay.day.id)
          }
          onClose={() => setModalDay(null)}
        />
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <RunFeedbackModal
          status={feedbackModal.status}
          existingFeedback={feedbackModal.existingFeedback}
          onSave={handleFeedbackSave}
          onClose={() => setFeedbackModal(null)}
        />
      )}
    </div>
  );
}

// Status Controls Component (tick, cross, speech bubble)
type StatusControlsProps = {
  feedback: RunFeedback | null;
  onStatusClick: (status: RunStatus) => void;
  onOpenFeedback: () => void;
  compact?: boolean;
};

function StatusControls({
  feedback,
  onStatusClick,
  onOpenFeedback,
  compact = false,
}: StatusControlsProps) {
  const status = feedback?.status;
  const hasStatus = !!status;
  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = compact ? "w-6 h-6" : "w-8 h-8";

  return (
    <div className="flex items-center gap-1">
      {/* Complete (tick) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusClick("completed");
        }}
        className={`${buttonSize} rounded-full flex items-center justify-center transition-colors ${
          status === "completed"
            ? "bg-green-500 text-white"
            : "text-gray-400 hover:text-green-500 hover:bg-green-50"
        }`}
        title="Mark as completed"
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>

      {/* Missed (cross) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusClick("missed");
        }}
        className={`${buttonSize} rounded-full flex items-center justify-center transition-colors ${
          status === "missed"
            ? "bg-orange-500 text-white"
            : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
        }`}
        title="Mark as missed"
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Feedback (speech bubble) - shows when status set, otherwise placeholder */}
      {hasStatus ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenFeedback();
          }}
          className={`${buttonSize} rounded-full flex items-center justify-center transition-colors text-gray-400 hover:text-blue-500 hover:bg-blue-50`}
          title="Add/edit feedback"
        >
          <svg
            className={iconSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      ) : (
        <div className={buttonSize} /> /* Placeholder to prevent layout shift */
      )}
    </div>
  );
}

type FullViewHandle = {
  scrollToDay: (dayIndex: number) => void;
};

type FullViewProps = {
  plan: Plan;
  progress: Record<string, ProgressValue>;
  onDayClick: (day: DayType, weekId: number) => void;
  onStatusClick: (weekId: number, dayId: number, status: RunStatus) => void;
  onOpenFeedback: (weekId: number, dayId: number) => void;
};

const FullView = forwardRef<FullViewHandle, FullViewProps>(function FullView(
  { plan, progress, onDayClick, onStatusClick, onOpenFeedback },
  ref,
) {
  const dayRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  let dayCounter = 0;

  useImperativeHandle(ref, () => ({
    scrollToDay: (dayIndex: number) => {
      const element = dayRefs.current.get(dayIndex);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
  }));

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {plan.weeks.map((week) => (
        <div key={week.id} className="relative pl-10 pb-8">
          <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-black" />

          <h3 className="font-semibold text-lg mb-3">Week {week.id}</h3>

          <div className="space-y-2">
            {week.days.map((day) => {
              const currentDayIndex = dayCounter++;
              const feedback = normalizeProgress(
                progress[getProgressKey(week.id, day.id)],
              );
              const status = feedback?.status;

              return (
                <div
                  key={day.id}
                  ref={(el) => {
                    if (el) dayRefs.current.set(currentDayIndex, el);
                  }}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    status === "completed"
                      ? "bg-green-50"
                      : status === "missed"
                        ? "bg-orange-50"
                        : "bg-gray-50"
                  }`}
                >
                  <StatusControls
                    feedback={feedback}
                    onStatusClick={(s) => onStatusClick(week.id, day.id, s)}
                    onOpenFeedback={() => onOpenFeedback(week.id, day.id)}
                    compact
                  />
                  <span
                    className={`font-medium w-24 ${
                      status === "completed"
                        ? "text-green-700"
                        : status === "missed"
                          ? "text-orange-700"
                          : ""
                    }`}
                  >
                    {day.day}
                  </span>
                  <span
                    className={
                      status === "completed"
                        ? "text-green-600"
                        : status === "missed"
                          ? "text-orange-600"
                          : "text-gray-600"
                    }
                  >
                    {day.distance}km
                  </span>
                  <span className="text-sm text-gray-500">
                    {day["number-of-intervals"]} intervals
                  </span>
                  <span className="text-sm text-gray-500 flex-1">
                    ({day["jogging-interval-time"]}min jog /{" "}
                    {day["walking-intervals-time"]}min walk)
                  </span>
                  <button
                    onClick={() => onDayClick(day, week.id)}
                    className="text-sm text-gray-500 hover:text-black hover:underline"
                  >
                    View more
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

type WeeklyViewProps = {
  week: WeekType;
  progress: Record<string, ProgressValue>;
  onDayClick: (day: DayType) => void;
  onStatusClick: (weekId: number, dayId: number, status: RunStatus) => void;
  onOpenFeedback: (weekId: number, dayId: number) => void;
};

function WeeklyView({
  week,
  progress,
  onDayClick,
  onStatusClick,
  onOpenFeedback,
}: WeeklyViewProps) {
  const dayMap = new Map<string, DayType>();
  week.days.forEach((day) => {
    dayMap.set(day.day, day);
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((dayName) => {
          const dayData = dayMap.get(dayName);
          const isTrainingDay = !!dayData;
          const feedback = dayData
            ? normalizeProgress(progress[getProgressKey(week.id, dayData.id)])
            : null;
          const status = feedback?.status;

          return (
            <div key={dayName} className="flex flex-col">
              {/* Day name above the card */}
              <h4
                className={`font-medium text-sm text-center mb-2 ${
                  isTrainingDay
                    ? status === "completed"
                      ? "text-green-700"
                      : status === "missed"
                        ? "text-orange-700"
                        : "text-black"
                    : "text-gray-400"
                }`}
              >
                {dayName.slice(0, 3)}
              </h4>

              {/* Card */}
              <div
                onClick={() => isTrainingDay && dayData && onDayClick(dayData)}
                className={`p-3 rounded-lg flex-1 ${
                  isTrainingDay
                    ? status === "completed"
                      ? "bg-green-50 border-2 border-green-300 cursor-pointer hover:border-green-400 transition-colors"
                      : status === "missed"
                        ? "bg-orange-50 border-2 border-orange-300 cursor-pointer hover:border-orange-400 transition-colors"
                        : "bg-white border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isTrainingDay && dayData ? (
                  <div className="space-y-2">
                    {/* Status controls at top of card */}
                    <div className="flex justify-end">
                      <StatusControls
                        feedback={feedback}
                        onStatusClick={(s) =>
                          onStatusClick(week.id, dayData.id, s)
                        }
                        onOpenFeedback={() =>
                          onOpenFeedback(week.id, dayData.id)
                        }
                        compact
                      />
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        status === "completed"
                          ? "text-green-700"
                          : status === "missed"
                            ? "text-orange-700"
                            : ""
                      }`}
                    >
                      {dayData.distance}km
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{dayData["number-of-intervals"]} intervals</div>
                      <div>Jog: {dayData["jogging-interval-time"]}min</div>
                      <div>Walk: {dayData["walking-intervals-time"]}min</div>
                    </div>
                    {dayData.instructions.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {dayData.instructions.slice(0, 2).map((inst, i) => (
                          <p key={i} className="truncate">
                            {inst}
                          </p>
                        ))}
                        {dayData.instructions.length > 2 && (
                          <p className="text-gray-400">
                            +{dayData.instructions.length - 2} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">Rest</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type DailyViewProps = {
  day: DayType;
  weekId: number;
  feedback: RunFeedback | null;
  onStatusClick: (status: RunStatus) => void;
  onOpenFeedback: () => void;
};

function DailyView({
  day,
  weekId,
  feedback,
  onStatusClick,
  onOpenFeedback,
}: DailyViewProps) {
  return (
    <div className="max-w-md mx-auto">
      <DayCard
        day={day}
        weekId={weekId}
        feedback={feedback}
        onStatusClick={onStatusClick}
        onOpenFeedback={onOpenFeedback}
      />
    </div>
  );
}

type DayCardProps = {
  day: DayType;
  weekId: number;
  feedback: RunFeedback | null;
  onStatusClick: (status: RunStatus) => void;
  onOpenFeedback: () => void;
};

function DayCard({
  day,
  weekId,
  feedback,
  onStatusClick,
  onOpenFeedback,
}: DayCardProps) {
  const status = feedback?.status;

  return (
    <div
      className={`rounded-xl p-6 shadow-sm border-2 ${
        status === "completed"
          ? "bg-green-50 border-green-300"
          : status === "missed"
            ? "bg-orange-50 border-orange-300"
            : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Week {weekId}</div>
          <h3
            className={`text-2xl font-bold ${
              status === "completed"
                ? "text-green-700"
                : status === "missed"
                  ? "text-orange-700"
                  : ""
            }`}
          >
            {day.day}
          </h3>
        </div>
        <StatusControls
          feedback={feedback}
          onStatusClick={onStatusClick}
          onOpenFeedback={onOpenFeedback}
        />
      </div>

      <div
        className={`text-5xl font-bold text-center py-6 border-y ${
          status === "completed"
            ? "border-green-200"
            : status === "missed"
              ? "border-orange-200"
              : "border-gray-100"
        }`}
      >
        <span
          className={
            status === "completed"
              ? "text-green-700"
              : status === "missed"
                ? "text-orange-700"
                : ""
          }
        >
          {day.distance}
        </span>
        <span
          className={`text-2xl ml-1 ${
            status === "completed"
              ? "text-green-500"
              : status === "missed"
                ? "text-orange-500"
                : "text-gray-500"
          }`}
        >
          km
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 py-6 text-center">
        <div>
          <div className="text-2xl font-semibold">
            {day["number-of-intervals"]}
          </div>
          <div className="text-sm text-gray-500">intervals</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">
            {day["jogging-interval-time"]}
          </div>
          <div className="text-sm text-gray-500">min jog</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">
            {day["walking-intervals-time"]}
          </div>
          <div className="text-sm text-gray-500">min walk</div>
        </div>
      </div>

      {/* Feedback summary if exists */}
      {feedback &&
        (feedback.perceivedEffort ||
          feedback.feelingRating ||
          feedback.notes) && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              status === "completed" ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            <div className="flex items-center gap-4 text-sm">
              {feedback.perceivedEffort && (
                <span>
                  Effort: <strong>{feedback.perceivedEffort}/10</strong>
                </span>
              )}
              {feedback.feelingRating && (
                <span>
                  Feeling: <strong>{feedback.feelingRating}/5</strong>
                </span>
              )}
            </div>
            {feedback.notes && (
              <p className="text-sm mt-2 text-gray-600">{feedback.notes}</p>
            )}
          </div>
        )}

      {day.instructions.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-medium mb-2">Instructions</h4>
          <ul className="space-y-2">
            {day.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-600">
                <span className="text-gray-400">{index + 1}.</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type DayModalProps = {
  day: DayType;
  weekId: number;
  feedback: RunFeedback | null;
  onStatusClick: (status: RunStatus) => void;
  onOpenFeedback: () => void;
  onClose: () => void;
};

function DayModal({
  day,
  weekId,
  feedback,
  onStatusClick,
  onOpenFeedback,
  onClose,
}: DayModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 z-10"
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
          <DayCard
            day={day}
            weekId={weekId}
            feedback={feedback}
            onStatusClick={onStatusClick}
            onOpenFeedback={onOpenFeedback}
          />
        </div>
      </div>
    </div>
  );
}
