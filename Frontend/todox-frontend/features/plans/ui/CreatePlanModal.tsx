import { useState } from "react";
import { Plan } from "../model/plan.types";
import { createPlan } from "../api/plans.api";
import styles from "./CreatePlanModal.module.css";

type Props = {
  onClose: () => void;
  onCreated?: (plan: Plan) => void; 
};

export function CreatePlanModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    const payload: Partial<Plan> = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (!payload.name) {
      setError("Please enter a plan name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createPlan(payload);
      onCreated?.(created);
      onClose();
    } catch {
      setError("Failed to create plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>New Plan</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Plan name"
              autoFocus
            />
          </label>

          <label className={styles.label}>
            Description (optional)
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={isSubmitting}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}