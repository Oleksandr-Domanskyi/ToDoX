import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getPlans, getPlanById } from "./plans.api";
import { Plan } from "../model/plan.types";

export function usePlans() {
	return useQuery({
		queryKey: ["plans"],
		queryFn: getPlans,
		staleTime: 60_000, // 1 минута
	});
}

type UsePlanByIdOptions = Pick<
	UseQueryOptions<Plan, unknown, Plan, [string, string]>,
	"enabled" | "retry"
>;

export const usePlanById = (planId: string, options?: UsePlanByIdOptions) => {
	return useQuery({
		queryKey: ["plan", planId],
		queryFn: () => getPlanById(planId),
		enabled: options?.enabled ?? !!planId,
		retry: options?.retry ?? false,
	});
};
