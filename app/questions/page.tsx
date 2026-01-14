"use client";
import { useState } from "react";
// import { useRouter } from "next/navigation";

import { SubmitButton } from "../components/SubmitButton";
import { generatePlanAction } from "@/app/actions/generatePlan";

type Ability = "beginner" | "novice" | "confident";

export default function Questions() {
  //   const router = useRouter();
  const [ability, setAbility] = useState<Ability>("beginner");
  const [weeks, setWeeks] = useState<number>(4);

  const options: { label: string; value: Ability }[] = [
    { label: "coach potato", value: "beginner" },
    { label: "par-boiled", value: "novice" },
    { label: "hot chip", value: "confident" },
  ];

  //   async function handleSubmit(e: React.FormEvent) {
  //     e.preventDefault();

  //     router.push(`/plan?ability=${ability}&weeks=${weeks}`);
  //   }

  return (
    <main>
      <h2 className="text-2xl font-bold mb-6">
        Tell us about your current fitness...
      </h2>
      <form action={generatePlanAction}>
        <fieldset>
          <legend>Current ability:</legend>

          {options.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="ability"
                value={value}
                checked={ability === value}
                onChange={() => setAbility(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <label>
          Weeks of training
          <input
            type="number"
            className="w-full border px-3 py-2"
            name="weeks"
            min={1}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            required
          />
        </label>
        {/* <button
          type="submit"
          //   disabled={loading}
          className="bg-blue-400 p-1 m-1 rounded-sm"
        >
          Generate Plan
        </button> */}
        <SubmitButton />
      </form>
    </main>
  );
}
