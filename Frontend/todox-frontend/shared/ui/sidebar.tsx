"use client";

import Link from "next/link";
import styles from "../../styles/Sidebar.module.css";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { usePlans } from "@/features/plans/api/plans.queries";
import { mapPlans } from "@/features/plans/lib/mapPlans";
import { cn } from "../lib/cn/utils";

import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";
import { CreatePlanModal } from "@/features/plans/ui/CreatePlanModal";
import { deletePlan } from "@/features/plans/api/plans.api";

import { SettingsModal } from "./SettingsModal";

type SortDir = "asc" | "desc";

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const STORAGE_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;

const FILTER_STORAGE_KEY = "plans-filter-query";

export function Sidebar() {
  const { data: plans, isLoading, error, refetch: refetchPlans } = usePlans();
  const pathname = usePathname();

  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [isResizing, setIsResizing] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ===== Sidebar width =====
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);

  useLayoutEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const n = saved ? Number(saved) : DEFAULT_WIDTH;

    const clamped = Number.isFinite(n)
      ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n))
      : DEFAULT_WIDTH;

    if (clamped !== sidebarWidth) setSidebarWidth(clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".app_shell");
    if (!shell) return;

    shell.style.setProperty("--sidebar-w", `${sidebarWidth}px`);
    window.localStorage.setItem(STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const onResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + dx));
      setSidebarWidth(next);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // ===== Inline filter (no modal) =====
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(FILTER_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const filterInputRef = useRef<HTMLInputElement | null>(null);
  const isFilterActive = filterQuery.trim().length > 0;

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, filterQuery);
    } catch {}
  }, [filterQuery]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const t = window.setTimeout(() => filterInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isFilterOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFilterOpen]);

  const openOrFocusFilter = () => {
    setIsFilterOpen(true);
  };

  const clearFilter = () => {
    setFilterQuery("");
    setIsFilterOpen(false);
  };

  // ===== Filter + sort =====
  const filteredPlans = useMemo(() => {
    const list = plans ?? [];
    const q = filterQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => (p.name ?? "").toLowerCase().includes(q));
  }, [plans, filterQuery]);

  const sortedPlans = useMemo(() => {
    if (!filteredPlans.length) return filteredPlans;

    const copy = [...filteredPlans];
    copy.sort((a, b) => {
      const nameA = (a.name ?? "").toLocaleLowerCase();
      const nameB = (b.name ?? "").toLocaleLowerCase();
      const cmp = nameA.localeCompare(nameB);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [filteredPlans, sortDir]);

  const items = mapPlans(sortedPlans, pathname);

  // ===== Actions =====
  const onAddTask = (planId: string) => {
    setActivePlanId(planId);
    setIsCreateTaskOpen(true);
  };

  const onEditPlan = (planId: string) => {
    console.log("edit plan", planId);
  };

  const router = useRouter();
  const path = usePathname();
  const onDeletePlan = async (planId: string) => {
  try {
    const isCurrentPlan =
      pathname === `/plans/${planId}` || path.startsWith(`/plans/${planId}/`);

    await deletePlan(planId);

    const result = await refetchPlans();
    const remaining = result.data ?? [];

    if (isCurrentPlan) {
      if (remaining.length > 0) router.push(`/plans/${remaining[0].id}`);
      else router.push("/plans");
    }
  } catch (e) {
    console.error("Failed to delete plan", e);
  }
};

  // ===== Content =====
  let content: ReactNode;

  if (isLoading) {
    content = <div className={styles.state}>Loading…</div>;
  } else if (error) {
    content = <div className={styles.state}>Failed to load</div>;
  } else if (!items.length) {
    content = (
      <div className={styles.state}>
        {isFilterActive ? "No matches" : "No plans yet"}
      </div>
    );
  } else {
    content = (
      <ul className={styles.list}>
        {items.map(({ plan, href, isActive }) => {
          const planId = String(plan.id);

          return (
            <li key={planId} className={styles.item}>
              <Link
                href={href}
                className={cn(styles.link, isActive && styles.active)}
                aria-current={isActive ? "page" : undefined}
                title={plan.name}
              >
                <div className={styles.plansIconsContainer}>
                  <span className={styles.name}>{plan.name}</span>

                  <div className={styles.IconsInPlansContainer}>
                    <i
                      className="fa-solid fa-plus"
                      title="Add task"
                      role="button"
                      tabIndex={0}
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        onAddTask(planId);
                      }}
                    />
                    <i
                      className="fa-regular fa-pen-to-square"
                      title="Edit plan"
                      role="button"
                      tabIndex={0}
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        onEditPlan(planId);
                      }}
                    />
                    <i
                      className="fa-regular fa-trash-can"
                      title="Delete plan"
                      role="button"
                      tabIndex={0}
                      onClick={async (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        await onDeletePlan(planId);
                      }}
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <aside
      className={styles.sidebar}
      aria-label="Plans sidebar"
      data-resizing={isResizing ? "true" : "false"}
    >
      <header className={styles.header}>
        <div className={styles.titlesAndIcons}>
          <h2 className={styles.title}>Your Plans</h2>
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </div>

        <div className={styles.iconsRow}>
          <div className={styles.iconsOptions}>
            <i
              className="fa-solid fa-plus"
              title="Add Plan"
              role="button"
              tabIndex={0}
              onClick={() => setIsCreatePlanOpen(true)}
            />

            {/* Filter icon glows when active */}
            <i
              className={cn(
                "fa-solid fa-filter",
                styles.iconBtn,
                isFilterActive && styles.iconActive
              )}
              title={isFilterActive ? `Filter: ${filterQuery}` : "Filter"}
              role="button"
              tabIndex={0}
              onClick={openOrFocusFilter}
            />

            {sortDir === "asc" ? (
              <i
                className="fa-solid fa-arrow-up-short-wide"
                title="Sort A → Z"
                role="button"
                tabIndex={0}
                onClick={() => setSortDir("desc")}
              />
            ) : (
              <i
                className="fa-solid fa-arrow-down-wide-short"
                title="Sort Z → A"
                role="button"
                tabIndex={0}
                onClick={() => setSortDir("asc")}
              />
            )}

            <i
              className="fa-solid fa-gear"
              title="Settings"
              role="button"
              tabIndex={0}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>

          {isFilterOpen && (
            <div className={styles.inlineFilter}>
              <input
                ref={filterInputRef}
                className={styles.filterInput}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter plans..."
              />

              <button
                type="button"
                className={styles.filterClear}
                onClick={filterQuery.length ? clearFilter : () => setIsFilterOpen(false)}
                aria-label={filterQuery.length ? "Clear filter" : "Close filter"}
                title={filterQuery.length ? "Clear" : "Close"}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className={styles.nav}>{content}</nav>

      <footer className={styles.footer}>
        <div className={styles.hint}>Select a plan to view tasks</div>
      </footer>

      <div
        className={styles.resizer}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onMouseDown={onResizeStart}
      />

      {isCreateTaskOpen && activePlanId && (
        <CreateTaskModal
          planId={activePlanId}
          onClose={() => {
            setIsCreateTaskOpen(false);
            setActivePlanId(null);
          }}
        />
      )}

      {isCreatePlanOpen && (
        <CreatePlanModal
          onClose={() => setIsCreatePlanOpen(false)}
          onCreated={async () => {
            await refetchPlans();
          }}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApply={(s) => setSortDir(s.sortPlans)}
      />
    </aside>
  );
}
