import { useQuery } from "@tanstack/react-query";
import { getTasksByPlan } from "./task.api";

export function useTasksByPlan(planId: string) {
  return useQuery({
    queryKey: ["tasks", planId],
    queryFn: () => getTasksByPlan(planId),
    enabled: !!planId,
  });
}
