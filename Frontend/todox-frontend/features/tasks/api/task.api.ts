import { api } from "@/shared/api/http";
import { Task, UpdateTaskRequest, TaskDto } from "../model/tasks.types";
import { Block } from "@/shared/types/block";

function assertPlanId(planId: string) {
	if (!planId || planId === "undefined" || planId === "null") {
		throw new Error("Invalid planId");
	}
}

export function getTasksByPlan(planId: string): Promise<Task[]> {
	assertPlanId(planId);
	return api<Task[]>(`/api/plans/${encodeURIComponent(planId)}/tasks`);
}

export function CreateTask(
	planId: string,
	payload: UpdateTaskRequest,
): Promise<Task> {
	assertPlanId(planId);

	const normalizedPayload = {
		...payload,
		blocks: normalizeBlocks(payload.blocks),
	};

	return api<Task>(`/api/plans/${encodeURIComponent(planId)}/tasks/Create`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(normalizedPayload),
	});
}

export function UpdateTask(
	planId: string,
	taskId: string,
	payload: TaskDto,
): Promise<string> {
	assertPlanId(planId);

	const normalizedPayload = {
		...payload,
		blocks: normalizeBlocks(payload.blocks),
	};

	return api<string>(
		`/api/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(
			taskId,
		)}/Update`,
		{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(normalizedPayload),
		},
	);
}

export function deleteTask(
	planId: string,
	id: string,
	signal?: AbortSignal,
): Promise<string> {
	assertPlanId(planId);

	return api<string>(
		`/api/plans/${encodeURIComponent(planId)}/tasks/${encodeURIComponent(
			id,
		)}/Delete`,
		{
			method: "DELETE",
			signal,
		},
	);
}

type BlockEnvelope = { data: Block };

function isBlockEnvelope(b: Block | BlockEnvelope): b is BlockEnvelope {
	return typeof b === "object" && b !== null && "data" in b;
}

function normalizeBlocks(blocks?: Array<Block | BlockEnvelope>): Block[] {
	return (blocks ?? []).map((b) => (isBlockEnvelope(b) ? b.data : b));
}
