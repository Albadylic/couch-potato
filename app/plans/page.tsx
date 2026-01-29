"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPlans, deletePlan, getPlanProgress, SavedPlan } from "@/lib/planStorage";
import { PotatoMascot, PotatoRunning } from "@/app/components/PotatoMascot";
import LoadingPotato from "@/app/components/LoadingPotato";

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
        <LoadingPotato message="Loading your plans..." />
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-dark">My Plans</h1>
        <Link
          href="/goal"
          className="btn-primary flex items-center gap-2"
        >
          <PotatoRunning size={20} />
          New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <PotatoMascot size={120} className="mx-auto mb-6" />
          <p className="text-stone mb-4">You don&apos;t have any saved plans yet.</p>
          <p className="text-stone-dark mb-6">Let&apos;s get you off the couch!</p>
          <Link
            href="/goal"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PotatoRunning size={24} />
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const { completed, missed, total } = getPlanProgress(plan);
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const createdDate = new Date(plan.createdAt).toLocaleDateString();

            return (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="card block hover:border-stone transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <PotatoRunning size={36} />
                    <h2 className="font-semibold text-lg text-stone-dark">
                      {plan.goal.distance} in {plan.goal.weeks} weeks
                    </h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(plan.id);
                    }}
                    className="text-sm text-error hover:text-stone-dark transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="text-sm text-stone mb-3 ml-12">
                  <span className="capitalize">{plan.goal.ability}</span>
                  <span className="mx-2">•</span>
                  <span>{plan.goal.frequency} days/week</span>
                  <span className="mx-2">•</span>
                  <span>Created {createdDate}</span>
                </div>

                <div className="flex items-center gap-3 ml-12">
                  <div className="flex-1 bg-cream-dark rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-sage h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-stone whitespace-nowrap">
                    {completed}/{total} ({percentage}%)
                    {missed > 0 && (
                      <span className="text-warning ml-2">• {missed} missed</span>
                    )}
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
