"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Plan, WeekType, DayType } from "@/types/week";

type ViewType = "full" | "weekly" | "daily";

type SelectedDay = {
  day: DayType;
  weekId: number;
} | null;

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PlanViewer({ plan }: { plan: Plan }) {
  const [view, setView] = useState<ViewType>("weekly");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [showWeekMenu, setShowWeekMenu] = useState(false);
  const [showDayMenu, setShowDayMenu] = useState(false);
  const [modalDay, setModalDay] = useState<SelectedDay>(null);
  const [rememberedDay, setRememberedDay] = useState<{ dayIndex: number; weekIndex: number } | null>(null);
  const dayMenuRef = useRef<HTMLDivElement>(null);
  const currentDayButtonRef = useRef<HTMLButtonElement>(null);
  const fullViewRef = useRef<{ scrollToDay: (dayIndex: number) => void }>(null);

  const totalWeeks = plan.weeks.length;
  const allDays = plan.weeks.flatMap((week, weekIndex) =>
    week.days.map((day) => ({ ...day, weekIndex, weekId: week.id }))
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
      // Daily → Weekly: remember current day and show its week
      setRememberedDay({ dayIndex: currentDay, weekIndex: allDays[currentDay].weekIndex });
      setCurrentWeek(allDays[currentDay].weekIndex);
    } else if (view === "daily" && newView === "full") {
      // Daily → Full: remember current day and scroll to it
      setRememberedDay({ dayIndex: currentDay, weekIndex: allDays[currentDay].weekIndex });
      setTimeout(() => {
        fullViewRef.current?.scrollToDay(currentDay);
      }, 0);
    } else if (view === "weekly" && newView === "daily") {
      // Weekly → Daily: return to remembered day if still on same week, otherwise first day of week
      if (rememberedDay && rememberedDay.weekIndex === currentWeek) {
        setCurrentDay(rememberedDay.dayIndex);
      } else {
        const firstDayOfWeek = allDays.findIndex(d => d.weekIndex === currentWeek);
        if (firstDayOfWeek !== -1) {
          setCurrentDay(firstDayOfWeek);
        }
      }
    } else if (view === "weekly" && newView === "full") {
      // Weekly → Full: scroll to first day of current week
      const firstDayOfWeek = allDays.findIndex(d => d.weekIndex === currentWeek);
      setTimeout(() => {
        fullViewRef.current?.scrollToDay(firstDayOfWeek !== -1 ? firstDayOfWeek : 0);
      }, 0);
    }

    setView(newView);
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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

            {/* Week dropdown menu */}
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

            {/* Day dropdown menu */}
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
            disabled={view === "weekly" ? currentWeek === totalWeeks - 1 : currentDay === totalDays - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* View Content */}
      {view === "full" && <FullView ref={fullViewRef} plan={plan} onDayClick={(day, weekId) => setModalDay({ day, weekId })} />}
      {view === "weekly" && <WeeklyView week={plan.weeks[currentWeek]} onDayClick={(day) => setModalDay({ day, weekId: plan.weeks[currentWeek].id })} />}
      {view === "daily" && <DailyView day={allDays[currentDay]} weekId={allDays[currentDay].weekId} />}

      {/* Modal */}
      {modalDay && (
        <DayModal
          day={modalDay.day}
          weekId={modalDay.weekId}
          onClose={() => setModalDay(null)}
        />
      )}
    </div>
  );
}

type FullViewHandle = {
  scrollToDay: (dayIndex: number) => void;
};

const FullView = forwardRef<FullViewHandle, { plan: Plan; onDayClick: (day: DayType, weekId: number) => void }>(
  function FullView({ plan, onDayClick }, ref) {
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
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {plan.weeks.map((week) => (
          <div key={week.id} className="relative pl-10 pb-8">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-black" />

            <h3 className="font-semibold text-lg mb-3">Week {week.id}</h3>

            <div className="space-y-2">
              {week.days.map((day) => {
                const currentDayIndex = dayCounter++;
                return (
                  <div
                    key={day.id}
                    ref={(el) => {
                      if (el) dayRefs.current.set(currentDayIndex, el);
                    }}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium w-24">{day.day}</span>
                    <span className="text-gray-600">{day.distance}km</span>
                    <span className="text-sm text-gray-500">
                      {day["number-of-intervals"]} intervals
                    </span>
                    <span className="text-sm text-gray-500 flex-1">
                      ({day["jogging-interval-time"]}min jog / {day["walking-intervals-time"]}min walk)
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
  }
);

function WeeklyView({ week, onDayClick }: { week: WeekType; onDayClick: (day: DayType) => void }) {
  // Create a map of day name to day data
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

          return (
            <div
              key={dayName}
              onClick={() => isTrainingDay && dayData && onDayClick(dayData)}
              className={`p-3 rounded-lg min-h-[200px] ${
                isTrainingDay
                  ? "bg-white border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <h4
                className={`font-medium text-sm mb-2 ${
                  isTrainingDay ? "text-black" : "text-gray-400"
                }`}
              >
                {dayName.slice(0, 3)}
              </h4>

              {isTrainingDay && dayData ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{dayData.distance}km</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{dayData["number-of-intervals"]} intervals</div>
                    <div>Jog: {dayData["jogging-interval-time"]}min</div>
                    <div>Walk: {dayData["walking-intervals-time"]}min</div>
                  </div>
                  {dayData.instructions.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {dayData.instructions.slice(0, 2).map((inst, i) => (
                        <p key={i} className="truncate">{inst}</p>
                      ))}
                      {dayData.instructions.length > 2 && (
                        <p className="text-gray-400">+{dayData.instructions.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm">Rest</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyView({ day, weekId }: { day: DayType; weekId: number }) {
  return (
    <div className="max-w-md mx-auto">
      <DayCard day={day} weekId={weekId} />
    </div>
  );
}

function DayCard({ day, weekId }: { day: DayType; weekId: number }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">Week {weekId}</div>
      <h3 className="text-2xl font-bold mb-4">{day.day}</h3>

      <div className="text-5xl font-bold text-center py-6 border-y border-gray-100">
        {day.distance}
        <span className="text-2xl text-gray-500 ml-1">km</span>
      </div>

      <div className="grid grid-cols-3 gap-4 py-6 text-center">
        <div>
          <div className="text-2xl font-semibold">{day["number-of-intervals"]}</div>
          <div className="text-sm text-gray-500">intervals</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{day["jogging-interval-time"]}</div>
          <div className="text-sm text-gray-500">min jog</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{day["walking-intervals-time"]}</div>
          <div className="text-sm text-gray-500">min walk</div>
        </div>
      </div>

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

function DayModal({ day, weekId, onClose }: { day: DayType; weekId: number; onClose: () => void }) {
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <DayCard day={day} weekId={weekId} />
        </div>
      </div>
    </div>
  );
}
