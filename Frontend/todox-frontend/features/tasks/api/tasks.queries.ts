import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getTasksByPlan } from "./task.api";
import { Task } from "../model/tasks.types";

type UseTasksByPlanOptions = Pick<
	UseQueryOptions<Task[], unknown, Task[], [string, string]>,
	"enabled" | "retry"
>;

export const useTasksByPlan = (
	planId: string,
	options?: UseTasksByPlanOptions
) => {
	return useQuery({
		queryKey: ["tasks", planId],
		queryFn: () => getTasksByPlan(planId),
		enabled: options?.enabled ?? !!planId,
		retry: options?.retry ?? false,
	});
};
