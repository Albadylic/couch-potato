import { Suspense } from "react";
import generatePlan from "@/lib/agent";
import { Plan } from "@/types/week";
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
  const plan: Plan | undefined = await generatePlan(ability, weeks, frequency, distance, unavailableDays, injuries);

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-dark mb-4">Oops! Failed to generate your plan.</p>
        <p className="text-stone">Please try again or adjust your goals.</p>
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
  const unavailableDays = params.unavailableDays?.split(',').filter(Boolean) ?? [];
  const injuries = params.injuries ? decodeURIComponent(params.injuries) : undefined;

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-stone-dark">Your Training Plan</h1>

      <Suspense fallback={
        <LoadingPotato message="Coach Spud is crafting your perfect plan..." />
      }>
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
