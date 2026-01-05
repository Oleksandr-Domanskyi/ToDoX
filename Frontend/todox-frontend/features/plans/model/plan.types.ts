import { Id } from "@/shared/types/id";

export interface Plan {
  id: Id;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}
