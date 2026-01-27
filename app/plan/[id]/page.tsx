"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlanById, SavedPlan } from "@/lib/planStorage";
import PlanViewerWithStorage from "@/app/components/PlanViewerWithStorage";

export default function SavedPlanPage() {
  const params = useParams();
  const id = params.id as string;
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const plan = getPlanById(id);
    setSavedPlan(plan);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4">
        <p className="text-center">Loading plan...</p>
      </main>
    );
  }

  if (!savedPlan) {
    return (
      <main className="max-w-5xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
        <p className="text-gray-600 mb-6">This plan doesn&apos;t exist or may have been deleted.</p>
        <Link
          href="/plans"
          className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          View All Plans
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {savedPlan.goal.distance} in {savedPlan.goal.weeks} weeks
        </h1>
        <Link
          href="/plans"
          className="text-sm text-gray-500 hover:text-black"
        >
          All Plans
        </Link>
      </div>

      <PlanViewerWithStorage
        plan={savedPlan.plan}
        goal={savedPlan.goal}
        existingPlanId={savedPlan.id}
      />
    </main>
  );
}
