"use client";

import type { ReactNode } from "react";
import styles from "./PlansPage.module.css";

export default function PlansLayout({ children }: { children: ReactNode }) {
  return <div className={styles.plansShell}>{children}</div>;
}