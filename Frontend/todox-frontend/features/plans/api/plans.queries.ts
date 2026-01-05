import { useQuery } from "@tanstack/react-query";
import { getPlans, getPlanById } from "./plans.api";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    staleTime: 60_000, // 1 минута
  });
}

export function usePlanById(planId: string) {
  return useQuery({
    queryKey: ["plans", planId],
    queryFn: () => getPlanById(planId),
    enabled: !!planId,
    staleTime: 60_000,
  });
}