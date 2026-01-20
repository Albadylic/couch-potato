import { Suspense } from "react";
import generatePlan from "@/lib/agent";
import { Plan } from "@/types/week";
import Week from "../components/Week";

type Props = {
  searchParams: {
    ability?: string;
    weeks?: string;
    frequency?: string;
  };
};

export default async function PlanPage({ searchParams }: Props) {
  const params = await searchParams;
  const ability = params.ability ?? "beginner";
  const weeks = Number(params.weeks ?? 8);
  const frequency = Number(params.frequency ?? 3);

  const plan: Plan | undefined = await generatePlan(ability, weeks, frequency);

  if (!plan) {
    return (
      <main className="max-w-xl mx-auto py-12">
        <p>Failed to generate plan.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Your Plan</h1>

      <Suspense fallback={<p>Generating plan...</p>}>
        {plan && (
          <div>
            {plan.weeks.map((week) => (
              <Week key={week.id} week={week} />
            ))}
          </div>
        )}
      </Suspense>
    </main>
  );
}
