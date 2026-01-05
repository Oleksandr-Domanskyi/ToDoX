import { api } from "@/shared/api/http";
import { Task } from "../model/tasks.types";

export function getTasksByPlan(planId: string): Promise<Task[]> {
  return api<Task[]>(`/plans/${planId}/tasks`);
}
