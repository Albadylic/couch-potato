"use client";
import { useState } from "react";
import generatePlan from "@/app/api/agent";
import { Plan } from "@/types/week";
import Week from "./components/Week";

type Ability = "beginner" | "novice" | "confident";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null | undefined>(null);
  const [ability, setAbility] = useState<Ability>("beginner");
  const [weeks, setWeeks] = useState<number>(4);

  const options: { label: string; value: Ability }[] = [
    { label: "beginner", value: "beginner" },
    { label: "novice", value: "novice" },
    { label: "confident", value: "confident" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const text = await generatePlan(ability, weeks);
    setPlan(text);

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Current ability:</legend>

          {options.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="goalArea"
                value={value}
                checked={ability === value}
                onChange={() => setAbility(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label>
          {" "}
          Weeks:
          <input
            type="number"
            min={1}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-400 p-1 m-1 rounded-sm"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </form>

      {plan && (
        <div>
          {plan.weeks.map((week) => (
            <Week key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}
