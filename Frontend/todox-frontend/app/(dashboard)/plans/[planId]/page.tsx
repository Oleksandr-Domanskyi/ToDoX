"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { usePlanById } from "@/features/plans/api/plans.queries";
import { useTasksByPlan } from "@/features/tasks/api/tasks.queries";

import { UpdateTaskModal } from "@/features/tasks/ui/UpdateTaskModal";
import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";

import { TaskBlock } from "@/shared/ui/task-block";
import type { Task } from "@/features/tasks/model/tasks.types";
import type { Block } from "@/shared/types/block";

import styles from "../../../../styles/PlanPage.module.css";
import { deleteTask } from "@/features/tasks/api/task.api";

function sortBlocksByOrder(blocks: Block[]) {
  return blocks
    .map((b, idx) => ({ b, idx }))
    .sort((x, y) => {
      const xo = typeof x.b.order === "number" ? x.b.order : Number.MAX_SAFE_INTEGER;
      const yo = typeof y.b.order === "number" ? y.b.order : Number.MAX_SAFE_INTEGER;
      if (xo !== yo) return xo - yo;
      return x.idx - y.idx;
    })
    .map((x) => x.b);
}

function formatRailLabel(t: Task, index: number) {
  const date = new Date(t.createdAt).toLocaleDateString();
  return `Task ${index + 1} — ${date}`;
}

const RAIL_STORAGE_KEY = "plan-rail-collapsed";

function loadRailCollapsed(): boolean {
  // no SSR issues because this file is "use client"
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(RAIL_STORAGE_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export default function PlanPage() {
  const { planId } = useParams<{ planId: string }>();

  const { data: plan } = usePlanById(planId);
  const { data: tasks, refetch: refetchTasks } = useTasksByPlan(planId);

  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const safeTasks = useMemo(() => tasks ?? [], [tasks]);
  const hasTasks = safeTasks.length > 0;

  // ✅ no useEffect, no ESLint warning
  const [railCollapsed, setRailCollapsed] = useState<boolean>(() => loadRailCollapsed());

  const toggleRail = () => {
    setRailCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(RAIL_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const taskRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!safeTasks.length) return;

    const elements = safeTasks
      .map((t) => taskRefs.current[t.id])
      .filter((el): el is HTMLLIElement => Boolean(el));

    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;

        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset["taskid"];
          if (!id) continue;

          const ratio = e.intersectionRatio ?? 0;
          if (!best || ratio > best.ratio) best = { id, ratio };
        }

        if (best && best.ratio > 0) setActiveId(best.id);
      },
      { threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
    );

    for (const el of elements) io.observe(el);
    return () => io.disconnect();
  }, [safeTasks]);

  const scrollToTask = (taskId: string) => {
    const el = taskRefs.current[taskId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(taskId);
  };

  const onUpdateTask = (pId: string, tId: string, task: Task) => {
    setActivePlanId(pId);
    setActiveTaskId(tId);
    setActiveTask(task);
    setIsUpdateTaskOpen(true);
  };

  const deleteTaskHandler = async (pId: string, tId: string, onSuccess?: () => void) => {
    try {
      await deleteTask(pId, tId);
      onSuccess?.();
    } catch (error) {
      console.error("deleteTask failed", error);
    }
  };

  return (
    <div className={`${styles.shell} ${railCollapsed ? styles.shellRailCollapsed : ""}`}>
      <main className={styles.main}>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1 className={styles.title}>{plan?.name}</h1>

            {plan && (
              <h2 className={styles.meta}>
                Created:{" "}
                <time dateTime={new Date(plan.createdAt).toISOString()}>
                  {new Date(plan.createdAt).toLocaleString()}
                </time>
              </h2>
            )}

            <p className={styles.description}>{plan?.description}</p>
          </header>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Tasks</h2>

              {hasTasks ? (
                <span className={styles.counter}>{safeTasks.length} total</span>
              ) : (
                <button
                  type="button"
                  className={styles.addTaskBtn}
                  onClick={() => setIsCreateTaskOpen(true)}
                  aria-label="Create first task"
                  title="Create task"
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  <span className={styles.addTaskText}>Create task</span>
                </button>
              )}
            </div>

            <ul className={styles.cardsList}>
              {safeTasks.map((task) => {
                const blocks = Array.isArray(task.blocks) ? task.blocks : [];
                const blocksSorted = sortBlocksByOrder(blocks);

                return (
                  <li
                    key={task.id}
                    className={styles.cardItem}
                    ref={(node) => {
                      taskRefs.current[task.id] = node;
                    }}
                    data-taskid={task.id}
                  >
                    <div className={styles.task}>
                      <div className={styles.taskHeader}>
                        <div className={styles.taskTitle}>{task.title}</div>

                        <div className={styles.taskHeaderIcons}>
                          <i
                            className="fa-regular fa-pen-to-square"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onUpdateTask(planId, task.id, task);
                            }}
                            role="button"
                            tabIndex={0}
                            title="Edit task"
                          />
                          <i
                            className="fa-regular fa-trash-can"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await deleteTaskHandler(planId, task.id, () => refetchTasks());
                            }}
                            role="button"
                            tabIndex={0}
                            title="Delete task"
                          />
                        </div>
                      </div>

                      <div className={styles.meta}>
                        Created: {new Date(task.createdAt).toLocaleString()}
                        {task.updatedAt &&
                          ` · Updated: ${new Date(task.updatedAt).toLocaleString()}`}
                      </div>

                      {blocksSorted.length > 0 && (
                        <div className={styles.blocks}>
                          {blocksSorted.map((block, i) => (
                            <div
                              key={
                                typeof block.order === "number"
                                  ? `${block.type}_${block.order}`
                                  : `${block.type}_${i}`
                              }
                              className={styles.block}
                            >
                              <TaskBlock block={block} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {isCreateTaskOpen && (
              <CreateTaskModal
                planId={planId}
                onCreated={async () => {
                  await refetchTasks();
                }}
                onClose={() => setIsCreateTaskOpen(false)}
              />
            )}

            {isUpdateTaskOpen && activePlanId && activeTaskId && activeTask && (
              <UpdateTaskModal
                planId={activePlanId}
                taskId={activeTaskId}
                Task={activeTask}
                onClose={async () => {
                  setIsUpdateTaskOpen(false);
                  setActivePlanId(null);
                  setActiveTaskId(null);
                  setActiveTask(null);
                  await refetchTasks();
                }}
              />
            )}
          </section>
        </div>
      </main>

      <aside className={styles.rail} aria-label="Navigation timeline">
        <div className={styles.railInner}>
          <div className={styles.railHeader}>Navigation Timeline</div>

          <ul className={styles.railList}>
            {safeTasks.map((t, idx) => {
              const isActive = activeId === t.id;

              return (
                <li key={t.id} className={styles.railItem}>
                  <button
                    type="button"
                    className={`${styles.railDotBtn} ${isActive ? styles.railDotBtnActive : ""}`}
                    onClick={() => scrollToTask(t.id)}
                    title={t.title}
                    aria-label={`Go to task: ${t.title}`}
                  >
                    <span className={styles.railDot} />
                  </button>

                  <div className={`${styles.railLabel} ${isActive ? styles.railLabelActive : ""}`}>
                    {formatRailLabel(t, idx)}
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className={styles.railToggle}
            onClick={toggleRail}
            aria-label={railCollapsed ? "Expand timeline" : "Collapse timeline"}
            title={railCollapsed ? "Expand timeline" : "Collapse timeline"}
          >
            {railCollapsed ? (
              <i className="fa-solid fa-angles-left" aria-hidden="true" />
            ) : (
              <i className="fa-solid fa-angles-right" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
