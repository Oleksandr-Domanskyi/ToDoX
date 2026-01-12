// app/(whatever)/plans/[planId]/page.tsx  (путь оставь свой)
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { usePlanById } from "@/features/plans/api/plans.queries";
import { useTasksByPlan } from "@/features/tasks/api/tasks.queries";

import { UpdateTaskModal } from "@/features/tasks/ui/UpdateTaskModal";
import { CreateTaskModal } from "@/features/tasks/ui/CreateTaskModal";

import { TaskBlock } from "@/shared/ui/task-block";
import type { Task } from "@/features/tasks/model/tasks.types";
import type { Block, BlockPosition } from "@/shared/types/block";

import styles from "../../../../styles/PlanPage.module.css";
import { deleteTask } from "@/features/tasks/api/task.api";

/**
 * Полная версия PlanPage:
 * - блоки рендерятся "как записано" (Row/Position)
 * - поддержка row/Row и position/Position
 * - правильный CSS Grid через inline style (gridRow/gridColumn)
 */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return fallback;
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function toBlockPosition(v: unknown): BlockPosition {
  if (typeof v === "number" && Number.isFinite(v)) {
    if (v === 0) return "left";
    if (v === 1) return "right";
    if (v === 2) return "full";
    return "full";
  }

  if (typeof v !== "string") return "full";
  const s = v.trim().toLowerCase();

  if (s === "left" || s === "l" || s === "0") return "left";
  if (s === "right" || s === "r" || s === "1") return "right";
  if (s === "full" || s === "f" || s === "2") return "full";

  if (s.includes("left")) return "left";
  if (s.includes("right")) return "right";
  if (s.includes("full")) return "full";

  return "full";
}

function getProp(obj: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) if (k in obj) return obj[k];
  return undefined;
}

/**
 * Сортировка "как записано":
 * Row ASC -> Position(left, right, full) -> order ASC -> idx
 */
function sortBlocksByLayout(blocks: Block[]): Block[] {
  const posRank = (p: BlockPosition) => (p === "left" ? 0 : p === "right" ? 1 : 2);

  return blocks
    .map((b, idx) => {
      const base = isRecord(b) ? (b as unknown as Record<string, unknown>) : {};
      const Row = readNumber(getProp(base, "Row", "row"), 0);
      const Position = toBlockPosition(getProp(base, "Position", "position"));
      const order = readNumber(getProp(base, "order", "Order"), Number.MAX_SAFE_INTEGER);

      return { b, idx, Row, Position, order };
    })
    .sort((a, c) => {
      if (a.Row !== c.Row) return a.Row - c.Row;

      const prA = posRank(a.Position);
      const prC = posRank(c.Position);
      if (prA !== prC) return prA - prC;

      if (a.order !== c.order) return a.order - c.order;

      return a.idx - c.idx;
    })
    .map((x) => x.b);
}

function formatRailLabel(t: Task, index: number) {
  const date = new Date(t.createdAt).toLocaleDateString();
  return `Task ${index + 1} — ${date}`;
}

const RAIL_STORAGE_KEY = "plan-rail-collapsed";

function loadRailCollapsed(): boolean {
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
                const blocks = Array.isArray(task.blocks) ? (task.blocks as Block[]) : [];
                const blocksSorted = sortBlocksByLayout(blocks);

                // Для корректного автоподбора количества строк:
                const maxRow = blocksSorted.reduce((m, b) => {
                  const base = isRecord(b) ? (b as unknown as Record<string, unknown>) : {};
                  const r = readNumber(getProp(base, "Row", "row"), 0);
                  return Math.max(m, r);
                }, 0);

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
                        {task.updatedAt && ` · Updated: ${new Date(task.updatedAt).toLocaleString()}`}
                      </div>

                      {blocksSorted.length > 0 && (
                        <div
                          className={styles.blocks}
                          style={{
                            // чтобы grid знал сколько строк, если используешь auto-rows — можно не задавать
                            // но это иногда помогает в сочетании с overflow/контентом
                            gridTemplateRows: `repeat(${maxRow + 1}, auto)`,
                          }}
                        >
                          {blocksSorted.map((block, i) => {
                            const base = isRecord(block)
                              ? (block as unknown as Record<string, unknown>)
                              : {};

                            const row = readNumber(getProp(base, "Row", "row"), 0);
                            const pos = toBlockPosition(getProp(base, "Position", "position"));

                            const gridColumn =
                              pos === "full" ? "1 / -1" : pos === "left" ? "1 / 2" : "2 / 3";
                            const gridRow = String(row + 1);

                            const ord = readNumber(getProp(base, "order", "Order"), i);

                            return (
                              <div
                                key={`${block.type}_${row}_${pos}_${ord}_${i}`}
                                className={`${styles.block} ${
                                  pos === "full" ? styles.blockFull : pos === "left" ? styles.blockLeft : styles.blockRight
                                }`}
                                style={{
                                  gridColumn,
                                  gridRow,
                                }}
                              >
                                <TaskBlock block={block} />
                              </div>
                            );
                          })}
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
