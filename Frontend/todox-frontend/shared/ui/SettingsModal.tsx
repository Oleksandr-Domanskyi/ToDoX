"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/SettingsModal.module.css";

type Settings = {
  compactSidebar: boolean;
  confirmDeletes: boolean;
  autosave: boolean;
  sortPlans: "asc" | "desc";
};

const STORAGE_KEY = "notebook-settings";

function loadSettings(): Settings {
  if (typeof window === "undefined") {
    return {
      compactSidebar: false,
      confirmDeletes: true,
      autosave: true,
      sortPlans: "asc",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no settings");
    const parsed = JSON.parse(raw) as Partial<Settings>;

    return {
      compactSidebar: parsed.compactSidebar ?? false,
      confirmDeletes: parsed.confirmDeletes ?? true,
      autosave: parsed.autosave ?? true,
      sortPlans: parsed.sortPlans ?? "asc",
    };
  } catch {
    return {
      compactSidebar: false,
      confirmDeletes: true,
      autosave: true,
      sortPlans: "asc",
    };
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (settings: Settings) => void; // опционально: применить в UI (sortDir и т.д.)
};

export function SettingsModal({ isOpen, onClose, onApply }: Props) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [savedMark, setSavedMark] = useState(false);

  // закрытие по Esc
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const canRender = useMemo(() => isOpen, [isOpen]);
  if (!canRender) return null;

  const applyAndClose = () => {
    saveSettings(settings);
    onApply?.(settings);
    setSavedMark(true);
    onClose();
  };

  const reset = () => {
    const defaults: Settings = {
      compactSidebar: false,
      confirmDeletes: true,
      autosave: true,
      sortPlans: "asc",
    };
    setSettings(defaults);
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h3 className={styles.title}>Settings</h3>
            {savedMark && <span className={styles.saved}>Saved</span>}
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Interface</div>

            <label className={styles.row}>
              <span>Compact sidebar</span>
              <input
                type="checkbox"
                checked={settings.compactSidebar}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, compactSidebar: e.target.checked }))
                }
              />
            </label>

            <label className={styles.row}>
              <span>Autosave</span>
              <input
                type="checkbox"
                checked={settings.autosave}
                onChange={(e) => setSettings((s) => ({ ...s, autosave: e.target.checked }))}
              />
            </label>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Safety</div>

            <label className={styles.row}>
              <span>Confirm deletes</span>
              <input
                type="checkbox"
                checked={settings.confirmDeletes}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, confirmDeletes: e.target.checked }))
                }
              />
            </label>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Plans</div>

            <label className={styles.row}>
              <span>Sort plans</span>
              <select
                className={styles.select}
                value={settings.sortPlans}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, sortPlans: e.target.value as Settings["sortPlans"] }))
                }
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={reset}>
            Reset
          </button>

          <div className={styles.footerRight}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.primaryBtn} onClick={applyAndClose}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
