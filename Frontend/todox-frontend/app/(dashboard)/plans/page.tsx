"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { usePlans } from "@/features/plans/api/plans.queries";
import { CreatePlanModal } from "@/features/plans/ui/CreatePlanModal";

import styles from "./PlansPage.module.css";
import type { Plan } from "@/features/plans/model/plan.types";

export default function PlansPage() {
	const router = useRouter();

	const { data: plans, isLoading, error, refetch: refetchPlans } = usePlans();
	const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

	const count = useMemo(() => plans?.length ?? 0, [plans]);
	const hasPlans = count > 0;

	if (isLoading) {
		return (
			<div className={styles.page}>
				<div className={styles.centerCard}>
					<div className={styles.stateTitle}>Loading…</div>
					<div className={styles.stateText}>Fetching your plans.</div>
					<div className={styles.skeletonRow} />
					<div className={styles.skeletonRow} />
					<div className={styles.skeletonRowSm} />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.page}>
				<div className={styles.centerCard}>
					<div className={styles.stateTitle}>Failed to load</div>
					<div className={styles.stateText}>
						Please check your connection and try again.
					</div>

					<div className={styles.actions}>
						<button
							type="button"
							className={styles.secondaryBtn}
							onClick={async () => {
								await refetchPlans();
							}}>
							Retry
						</button>

						<button
							type="button"
							className={styles.primaryBtn}
							onClick={() => setIsCreatePlanOpen(true)}>
							<span className={styles.btnIcon}>+</span>
							Create plan
						</button>
					</div>
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
			</div>
		);
	}

	return (
		<>
			<div className={styles.page}>
				<div className={styles.hero}>
					<div className={styles.heroGlow} aria-hidden="true" />

					<div className={styles.heroHeader}>
						{!hasPlans ? (
							<>
								<div className={styles.badge}>Welcome</div>
								<h1 className={styles.title}>Create your first plan</h1>
								<p className={styles.description}>
									Plans help you group tasks and notes into a clear workflow.
									Start simple — you can refine anytime.
								</p>
							</>
						) : (
							<>
								<div className={styles.badge}>Plans</div>
								<h1 className={styles.title}>Select a plan</h1>
								<p className={styles.description}>
									Choose a plan from the sidebar, or create a new one to
									organize your next workstream.
								</p>
							</>
						)}

						<div className={styles.actions}>
							<button
								type="button"
								className={styles.primaryBtn}
								onClick={() => setIsCreatePlanOpen(true)}>
								<span className={styles.btnIcon}>+</span>
								{hasPlans ? "Create plan" : "Create your first plan"}
							</button>

							<button
								type="button"
								className={styles.secondaryBtn}
								onClick={async () => {
									await refetchPlans();
								}}
								title="Refresh plans">
								Refresh
							</button>
						</div>

						{hasPlans ? (
							<div className={styles.metaRow}>
								<span className={styles.metaPill}>
									<span className={styles.metaDot} />
									{count} {count === 1 ? "plan" : "plans"} available
								</span>
								<span className={styles.metaHint}>
									Tip: use filter/sort in the sidebar.
								</span>
							</div>
						) : (
							<div className={styles.metaRow}>
								<span className={styles.metaHint}>
									Tip: name it by outcome (e.g. “Release v1”, “Study Plan”,
									“Client X”).
								</span>
							</div>
						)}
					</div>

					<div className={styles.features}>
						<div className={styles.featureCard}>
							<div className={styles.featureTitle}>Structure</div>
							<div className={styles.featureText}>
								Split work into plans, then add tasks with blocks.
							</div>
						</div>

						<div className={styles.featureCard}>
							<div className={styles.featureTitle}>Focus</div>
							<div className={styles.featureText}>
								Keep only what matters in one place — no noise.
							</div>
						</div>

						<div className={styles.featureCard}>
							<div className={styles.featureTitle}>Momentum</div>
							<div className={styles.featureText}>
								Create tasks quickly and iterate as you go.
							</div>
						</div>
					</div>
				</div>
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
