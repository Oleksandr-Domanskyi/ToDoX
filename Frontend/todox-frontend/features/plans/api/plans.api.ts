import { api } from "@/shared/api/http";
import { Plan } from "../model/plan.types";

export function getPlans(): Promise<Plan[]> {
  return api<Plan[]>("/plans");
}

export function getPlanById(id: string): Promise<Plan> {
  return api<Plan>(`/plans/${id}`);
}
