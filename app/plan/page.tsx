import { Suspense } from "react";
import Link from "next/link";
import generatePlan, { GeneratePlanResult } from "@/lib/agent";
import PlanViewerWithStorage from "../components/PlanViewerWithStorage";
import { SavedPlanGoal } from "@/lib/planStorage";
import LoadingPotato from "../components/LoadingPotato";

type Props = {
  searchParams: {
    ability?: string;
    weeks?: string;
    frequency?: string;
    distance?: string;
    unavailableDays?: string;
    injuries?: string;
  };
};

async function PlanContent({
  ability,
  weeks,
  frequency,
  distance,
  unavailableDays,
  injuries,
}: {
  ability: string;
  weeks: number;
  frequency: number;
  distance: string;
  unavailableDays: string[];
  injuries?: string;
}) {
  const result: GeneratePlanResult = await generatePlan(
    ability,
    weeks,
    frequency,
    distance,
    unavailableDays,
    injuries
  );

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 mb-4 rounded-full bg-orange-100">
          <svg
            className="w-12 h-12 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-stone-dark mb-2 font-medium">
          Oops! Failed to generate your plan.
        </p>
        <p className="text-stone mb-6 text-sm max-w-md mx-auto">
          {result.error}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/plan?ability=${ability}&weeks=${weeks}&frequency=${frequency}&distance=${distance}${unavailableDays.length > 0 ? `&unavailableDays=${unavailableDays.join(",")}` : ""}${injuries ? `&injuries=${encodeURIComponent(injuries)}` : ""}`}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Adjust Goals
          </Link>
        </div>
      </div>
    );
  }

  const plan = result.plan;

  // Additional defensive check for empty weeks
  if (!plan.weeks || plan.weeks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 mb-4 rounded-full bg-orange-100">
          <svg
            className="w-12 h-12 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-stone-dark mb-2 font-medium">
          Oops! The generated plan is empty.
        </p>
        <p className="text-stone mb-6 text-sm max-w-md mx-auto">
          Coach Spud had trouble creating your plan. Please try again.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/plan?ability=${ability}&weeks=${weeks}&frequency=${frequency}&distance=${distance}${unavailableDays.length > 0 ? `&unavailableDays=${unavailableDays.join(",")}` : ""}${injuries ? `&injuries=${encodeURIComponent(injuries)}` : ""}`}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Adjust Goals
          </Link>
        </div>
      </div>
    );
  }

  const goal: SavedPlanGoal = {
    distance,
    weeks,
    ability,
    frequency,
    unavailableDays,
    injuries,
  };

  return <PlanViewerWithStorage plan={plan} goal={goal} />;
}

export default async function PlanPage({ searchParams }: Props) {
  const params = await searchParams;
  const ability = params.ability ?? "beginner";
  const weeks = Number(params.weeks ?? 8);
  const frequency = Number(params.frequency ?? 3);
  const distance = params.distance ?? "5K";
  const unavailableDays =
    params.unavailableDays?.split(",").filter(Boolean) ?? [];
  const injuries = params.injuries
    ? decodeURIComponent(params.injuries)
    : undefined;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-stone-dark">
        Your Training Plan
      </h1>

      <Suspense
        fallback={
          <LoadingPotato message="Coach Spud is crafting your perfect plan..." />
        }
      >
        <PlanContent
          ability={ability}
          weeks={weeks}
          frequency={frequency}
          distance={distance}
          unavailableDays={unavailableDays}
          injuries={injuries}
        />
      </Suspense>
    </main>
  );
}
