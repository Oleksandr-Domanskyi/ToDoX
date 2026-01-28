import { api } from "@/shared/api/http";
import type { Plan, UpdatePlanRequest } from "../model/plan.types";

export function getPlans(): Promise<Plan[]> {
	return api<Plan[]>("/plans");
}

export function getPlanById(id: string): Promise<Plan> {
	return api<Plan>(`/plans/${id}`);
}

export function createPlan(payload: Partial<Plan>): Promise<Plan> {
	return api<Plan>("/plans", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export function deletePlan(id: string, signal?: AbortSignal): Promise<string> {
	return api<string>(`/plans/${id}`, {
		method: "DELETE",
		signal,
	});
}

export async function editPlan(payload: UpdatePlanRequest): Promise<void> {
	await api("/plans/update", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}
