"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlans } from "@/features/plans/api/plans.queries";
import styles from "../../app/styles/Sidebar.module.css";

export function Sidebar() {
  const { data: plans, isLoading, error } = usePlans();
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Plans sidebar">
      <div className={styles.header}>
        <h2 className={styles.title}>Your Plans</h2>
      </div>

      <nav className={styles.nav}>
        {isLoading && <div className={styles.state}>Loading…</div>}
        {error && <div className={styles.state}>Failed to load</div>}

        {!isLoading && !error && (!plans || plans.length === 0) && (
          <div className={styles.state}>No plans yet</div>
        )}

        {!isLoading && !error && plans && plans.length > 0 && (
          <ul className={styles.list}>
            {plans.map((p) => {
              const href = `/plans/${p.id}`;
              const isActive =
                pathname === href || pathname?.startsWith(`${href}/`);

              return (
                <li key={p.id} className={styles.item}>
                  <Link
                    href={href}
                    className={`${styles.link} ${isActive ? styles.active : ""}`}
                    title={p.name}
                  >
                  
                    <span className={styles.name}>{p.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.hint}>Select a plan to view tasks</div>
      </div>
    </aside>
  );
}
