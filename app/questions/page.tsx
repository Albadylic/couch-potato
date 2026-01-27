"use client";
import { useState } from "react";

import { SubmitButton } from "../components/SubmitButton";
import { generatePlanAction } from "@/app/actions/generatePlan";

type Ability = "beginner" | "novice" | "confident";

export default function Questions() {
  const [ability, setAbility] = useState<Ability>("beginner");
  const [weeks, setWeeks] = useState<number>(4);
  const [frequency, setFrequency] = useState<number>(1);

  const options: { label: string; value: Ability }[] = [
    { label: "couch potato", value: "beginner" },
    { label: "par-boiled", value: "novice" },
    { label: "hot chip", value: "confident" },
  ];

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
        <label>
          Activities each week
          <input
            type="number"
            className="w-full border px-3 py-2"
            name="frequency"
            min={1}
            max={6}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            required
          />
        </label>
        <SubmitButton />
      </form>
    </main>
  );
}
