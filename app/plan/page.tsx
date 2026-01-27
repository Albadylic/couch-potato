import { Suspense } from "react";
import generatePlan from "@/lib/agent";
import { Plan } from "@/types/week";
import Week from "../components/Week";

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
    return <p>Failed to generate plan.</p>;
  }

  return (
    <div>
      {plan.weeks.map((week) => (
        <Week key={week.id} week={week} />
      ))}
    </div>
  );
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
    <main className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Your Plan</h1>

      <Suspense fallback={<p>Generating plan...</p>}>
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
