"use client";

import { useParams } from "next/navigation";
import { usePlanById } from "@/features/plans/api/plans.queries";
import { useTasksByPlan } from "@/features/tasks/api/tasks.queries";
import { TaskBlock } from "@/shared/ui/task-block";
import styles from "../../../../styles/PlanPage.module.css";

export default function PlanPage() {
  const { planId } = useParams<{ planId: string }>();

  const { data: plan } = usePlanById(planId);
  const { data: tasks } = useTasksByPlan(planId);

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
      <span className={styles.counter}>{tasks?.length} total</span>
    </div>

    <ul className={styles.taskList}>
      {tasks?.map(task => (
        <li key={task.id} className={styles.task}>
          <div className={styles.taskHeader}>
            <div className={styles.taskTitle}>{task.title}</div>
              {/*<span
              className={[
                styles.status,
                task.isCompleted ? styles.statusDone : "",
              ].join(" ")}
            >
              {task.isCompleted ? "done" : "todo"}
            </span>*/}

          </div>
        <div className={styles.meta}>
            Created: {new Date(task.createdAt).toLocaleString()}
            {task.updatedAt &&
              ` · Updated: ${new Date(task.updatedAt).toLocaleString()}`}
          </div>
          
          {task.blocks.length > 0 && (
            <div className={styles.blocks}>
              {task.blocks.map((block, i) => (
                <div key={i} className={styles.block}>
                  <TaskBlock block={block} />
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  </section>
</div>
  );
}
