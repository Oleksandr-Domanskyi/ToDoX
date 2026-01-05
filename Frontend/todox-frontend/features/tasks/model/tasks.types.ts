import { Block } from "@/shared/types/block";
import { Id } from "@/shared/types/id";

export interface Task {
  id: Id;
  planId: Id;
  title: string;
  isCompleted: boolean;
  blocks: Block[];
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateTaskRequest {
  title: string;
  isCompleted: boolean;
  blocks: Block[];
}
