// "use client";

// import { useState } from "react";
import generatePlan from "@/lib/agent";
import { savePlanAction } from "@/app/actions/savePlan";
import { Plan } from "@/types/week";
import Week from "../components/Week";
import Link from "next/link";

type Props = {
  searchParams: {
    ability?: string;
    weeks?: string;
    frequency?: number;
  };
};

export default async function PlanPage({ searchParams }: Props) {
  const params = await searchParams;
  const ability = params.ability ?? "beginner";
  const weeks = Number(params.weeks ?? 8);
  const frequency = Number(params.frequency ?? 3);

  // const [isSaved, setIsSaved] = useState(false);

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
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Your Plan</h1>

        <div className="flex justify-around">
          <Link
            href="/questions"
            className="rounded bg-black px-6 py-3 m-1 text-white hover:bg-gray-800"
          >
            Restart
          </Link>
          <button
            className="rounded bg-black px-6 py-3 m-1 text-white hover:bg-gray-800"
            onClick={async () => {
              try {
                await savePlanAction(plan);
                // setIsSaved(true);
              } catch (err) {
                console.error(err);
                alert("Failed to save plan");
              }
            }}
          >
            Save plan
            {/* {isSaved ? "Saved!" : "Save plan"} */}
          </button>
        </div>
      </div>

      {plan && (
        <div>
          {plan.weeks.map((week) => (
            <Week key={week.id} week={week} />
          ))}
        </div>
      )}
    </main>
  );
}
