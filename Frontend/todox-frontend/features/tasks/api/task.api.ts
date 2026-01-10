import { api } from "@/shared/api/http";
import { Task, UpdateTaskRequest } from "../model/tasks.types";
import { TaskDto } from "../model/tasks.types";
import { Block } from "@/shared/types/block";

export function getTasksByPlan(planId: string): Promise<Task[]> {
  return api<Task[]>(`/plans/${planId}/tasks`);
}

export function CreateTask(planId: string, payload: UpdateTaskRequest): Promise<Task> {
  const normalizedPayload = {
    ...payload,
    blocks: normalizeBlocks(payload.blocks),
  };

  return api<Task>(`/plans/${planId}/tasks/Create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedPayload),
  });
}

export function UpdateTask(planId: string, taskId: string, payload: TaskDto): Promise<string> {
  const normalizedPayload = {
    ...payload,
    blocks: normalizeBlocks(payload.blocks),
  };

  return api<string>(`/plans/${planId}/tasks/${taskId}/Update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedPayload),
  });
}





type BlockEnvelope = { data: Block };

function isBlockEnvelope(b: Block | BlockEnvelope): b is BlockEnvelope {
  return typeof b === "object" && b !== null && "data" in b;
}

function normalizeBlocks(blocks?: Array<Block | BlockEnvelope>): Block[] {
  return (blocks ?? []).map((b) => (isBlockEnvelope(b) ? b.data : b));
}