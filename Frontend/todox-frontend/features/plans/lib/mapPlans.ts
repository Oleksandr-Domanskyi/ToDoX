import { Plan } from "../model/plan.types";

export function mapPlans(plans: Plan[] | undefined, pathname: string | null) {
  if (!plans?.length) return [];

  return plans.map((p) => {
    const href = `/plans/${p.id}`;
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return { plan: p, href, isActive };
  });
}