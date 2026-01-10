"use client";

import type { ReactNode } from "react";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../../styles/Sidebar.module.css";
import { usePlans } from "@/features/plans/api/plans.queries";
import { mapPlans } from "@/features/plans/lib/mapPlans";
import { cn } from "../lib/cn/utils";
import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";
import { CreatePlanModal } from "@/features/plans/ui/CreatePlanModal";

type SortDir = "asc" | "desc";

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const STORAGE_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;

export function Sidebar() {
  const { data: plans, isLoading, error } = usePlans();
  const pathname = usePathname();

  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [isResizing, setIsResizing] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);

  useLayoutEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const n = saved ? Number(saved) : DEFAULT_WIDTH;

    const clamped = Number.isFinite(n)
      ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n))
      : DEFAULT_WIDTH;

    if (clamped !== sidebarWidth) {
      setSidebarWidth(clamped);
    }
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

  const sortedPlans = useMemo(() => {
    if (!plans?.length) return plans;

    const copy = [...plans];
    copy.sort((a, b) => {
      const nameA = (a.name ?? "").toLocaleLowerCase();
      const nameB = (b.name ?? "").toLocaleLowerCase();
      const cmp = nameA.localeCompare(nameB);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [plans, sortDir]);

  const items = mapPlans(sortedPlans, pathname);

  const onAddTask = (planId: string) => {
    setActivePlanId(planId);
    setIsCreateTaskOpen(true);
  };

  const onEditPlan = (planId: string) => {
    console.log("edit plan", planId);
  };

  const onDeletePlan = (planId: string) => {
    console.log("delete plan", planId);
  };

  let content: ReactNode;

  if (isLoading) {
    content = <div className={styles.state}>Loading…</div>;
  } else if (error) {
    content = <div className={styles.state}>Failed to load</div>;
  } else if (!items.length) {
    content = <div className={styles.state}>No plans yet</div>;
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
                      onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        onDeletePlan(planId);
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

        <div className={styles.iconsOptions}>
          <i
            className="fa-solid fa-plus"
            title="Add Plan"
            role="button"
            tabIndex={0}
            onClick={() => setIsCreatePlanOpen(true)}
          />
          <i className="fa-solid fa-filter" title="Filter" />

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

          <i className="fa-solid fa-gear" aria-hidden="true" title="Settings" />
        </div>
      </header>

      <nav className={styles.nav}>{content}</nav>

      <footer className={styles.footer}>
        <div className={styles.hint}>Select a plan to view tasks</div>
      </footer>

      {/* Resizer handle */}
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
        <CreatePlanModal onClose={() => setIsCreatePlanOpen(false)} />
      )}
    </aside>
  );
}
