"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPlans, deletePlan, getPlanProgress, SavedPlan } from "@/lib/planStorage";

export default function PlansPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPlans(getAllPlans());
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlan(id);
      setPlans(getAllPlans());
    }
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4">
        <p className="text-center">Loading plans...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Plans</h1>
        <Link
          href="/goal"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
        >
          Create New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don&apos;t have any saved plans yet.</p>
          <Link
            href="/goal"
            className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const { completed, total } = getPlanProgress(plan);
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const createdDate = new Date(plan.createdAt).toLocaleDateString();

            return (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="block border rounded-lg p-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-lg">
                    {plan.goal.distance} in {plan.goal.weeks} weeks
                  </h2>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(plan.id);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  <span className="capitalize">{plan.goal.ability}</span>
                  <span className="mx-2">•</span>
                  <span>{plan.goal.frequency} days/week</span>
                  <span className="mx-2">•</span>
                  <span>Created {createdDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {completed}/{total} days ({percentage}%)
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
