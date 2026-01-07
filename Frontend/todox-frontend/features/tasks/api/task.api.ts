import { api } from "@/shared/api/http";
import { Task, UpdateTaskRequest } from "../model/tasks.types";
import { TaskDto } from "../model/tasks.types";

export function getTasksByPlan(planId: string): Promise<Task[]> {
  return api<Task[]>(`/plans/${planId}/tasks`);
}

export function CreateTask(
  planId: string,
  payload: UpdateTaskRequest
): Promise<Task> {
  return api<Task>(`/plans/${planId}/tasks/Create`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
}


export function UpdateTask(
  planId: string,
  taskId: string,
  payload: TaskDto
): Promise<string> {
  return api<string>(`/plans/${planId}/tasks/${taskId}/Update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
