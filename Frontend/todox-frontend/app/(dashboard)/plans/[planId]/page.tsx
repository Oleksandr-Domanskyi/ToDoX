"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { usePlanById } from "@/features/plans/api/plans.queries";
import { useTasksByPlan } from "@/features/tasks/api/tasks.queries";
import { UpdateTaskModal } from "@/features/tasks/ui/UpdateTaskModal";

import { TaskBlock } from "@/shared/ui/task-block";
import type { Task } from "@/features/tasks/model/tasks.types";
import type { Block } from "@/shared/types/block";

import styles from "../../../../styles/PlanPage.module.css";


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

export default function PlanPage() {
  const { planId } = useParams<{ planId: string }>();

  const { data: plan } = usePlanById(planId);

  const { data: tasks, refetch: refetchTasks } = useTasksByPlan(planId);

  const [isUpdateTaskOpen, setIsUpdateTaskOpen] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const safeTasks = useMemo(() => tasks ?? [], [tasks]);

  const onUpdateTask = (pId: string, tId: string, task: Task) => {
    setActivePlanId(pId);
    setActiveTaskId(tId);
    setActiveTask(task);
    setIsUpdateTaskOpen(true);
  };

  return (
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
          <span className={styles.counter}>{safeTasks.length} total</span>
        </div>

        <ul className={styles.taskList}>
          {safeTasks.map((task) => {
            const blocks = Array.isArray(task.blocks) ? task.blocks : [];
            const blocksSorted = sortBlocksByOrder(blocks);

            return (
              <li key={task.id} className={styles.task}>
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitle}>{task.title}</div>

                  <i
                    className="fa-regular fa-pen-to-square"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUpdateTask(planId, task.id, task);
                    }}
                  />
                </div>

                <div className={styles.meta}>
                  Created: {new Date(task.createdAt).toLocaleString()}
                  {task.updatedAt && ` · Updated: ${new Date(task.updatedAt).toLocaleString()}`}
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
              </li>
            );
          })}
        </ul>

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
  );
}
