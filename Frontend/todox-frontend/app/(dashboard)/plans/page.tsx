"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { usePlans } from "@/features/plans/api/plans.queries";
import { CreatePlanModal } from "@/features/plans/ui/CreatePlanModal";

import styles from "../plans/PlansPage.module.css";
import type { Plan } from "@/features/plans/model/plan.types";

export default function PlansPage() {
  const router = useRouter();

  const { data: plans, isLoading, error, refetch: refetchPlans } = usePlans();
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  const hasPlans = (plans?.length ?? 0) > 0;

  if (isLoading) {
    return <div className={styles.page}><div className={styles.state}>Loading…</div></div>;
  }

  if (error) {
    return <div className={styles.page}><div className={styles.state}>Failed to load</div></div>;
  }

  return (
    <>
      <div className={styles.page}>
        {!hasPlans ? (
          <div className={styles.emptyState}>
            <h1 className={styles.title}>No plans yet</h1>

            <p className={styles.description}>
              Create your first plan to start organizing your tasks and notes.
            </p>

            <button
              className={styles.primaryBtn}
              onClick={() => setIsCreatePlanOpen(true)}
            >
              + Create your first plan
            </button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h1 className={styles.title}>Select a plan</h1>

            <p className={styles.description}>
              Choose a plan from the sidebar or create a new one.
            </p>

            <button
              className={styles.primaryBtn}
              onClick={() => setIsCreatePlanOpen(true)}
            >
              + Create plan
            </button>
          </div>
        )}
      </div>

      {isCreatePlanOpen && (
        <CreatePlanModal
          onClose={() => setIsCreatePlanOpen(false)}
          onCreated={async (created: Plan) => {
            await refetchPlans();

            router.push(`/plans/${created.id}`);
          }}
        />
      )}
    </>
  );
}
