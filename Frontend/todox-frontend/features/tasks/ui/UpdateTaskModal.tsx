"use client";

import { useMemo, useState } from "react";
import styles from "./UpdateTaskModal.module.css";

import type { Block } from "@/shared/types/block";
import type { Task } from "../model/tasks.types";
import { UpdateTask } from "../api/task.api";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// DTO под твой backend TaskDto (минимум нужного)
type TaskDtoPayload = {
  id: string;
  planId: string;
  title: string;
  isCompleted: boolean;
  blocks: Block[];
  createdAt: string;
  updatedAt?: string | null;
};

type Props = {
  planId: string;
  taskId: string;
  Task: Task;
  onClose: () => void;
};

type UiBlock = {
  clientId: string;
  data: Block;
};

function makeClientId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `b_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Auto-resize textarea height to fit its content.
 * No internal scrollbars; modal body handles overflow.
 */
function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "0px";
  el.style.height = `${el.scrollHeight}px`;
}

export function UpdateTaskModal({ planId, taskId, Task, onClose }: Props) {
  const [title, setTitle] = useState(() => Task.title ?? "");
  const [isCompleted, setIsCompleted] = useState(() => !!Task.isCompleted);

  // UI blocks with stable ids for DnD (важно: НЕ индекс)
  const [blocks, setBlocks] = useState<UiBlock[]>(() =>
    (Task.blocks ?? []).map((b) => ({ clientId: makeClientId(), data: b }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => blocks.map((b) => b.clientId), [blocks]);

  const updatedAtText = useMemo(() => {
    return Task.updatedAt ? new Date(Task.updatedAt).toLocaleString() : "N/A";
  }, [Task.updatedAt]);

  const addBlock = (type: Block["type"]) => {
    const data: Block =
      type === "text"
        ? { type: "text", content: "" }
        : type === "image"
          ? { type: "image", imageUrl: "" }
          : type === "checklist"
            ? { type: "checklist", items: [] }
            : { type: "code", codeContent: "", language: "ts" };

    setBlocks((prev) => [...prev, { clientId: makeClientId(), data }]);
  };

  const updateBlock = (clientId: string, next: Block) => {
    setBlocks((prev) =>
      prev.map((b) => (b.clientId === clientId ? { ...b, data: next } : b))
    );
  };

  const removeBlock = (clientId: string) => {
    setBlocks((prev) => prev.filter((b) => b.clientId !== clientId));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.clientId === active.id);
      const newIndex = prev.findIndex((b) => b.clientId === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const submit = async () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a task title.");
      return;
    }

    const payload: TaskDtoPayload = {
      id: taskId,
      planId,
      title: trimmedTitle,
      isCompleted,
      blocks: blocks.map((b) => b.data),
      createdAt: Task.createdAt,
      updatedAt: Task.updatedAt ?? null,
    };

    setIsSubmitting(true);
    try {
      await UpdateTask(planId, taskId, payload);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to update task. Please try again.");
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
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Edit Task</h3>
            <div className={styles.meta}>Last updated: {updatedAtText}</div>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <label className={styles.label}>
            Title
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </label>

          <label className={styles.completedRow}>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            <span>Completed</span>
          </label>

          <div className={styles.blockToolbar}>
            <button type="button" onClick={() => addBlock("text")}>
              + Text
            </button>
            <button type="button" onClick={() => addBlock("image")}>
              + Image
            </button>
            <button type="button" onClick={() => addBlock("checklist")}>
              + Checklist
            </button>
            <button type="button" onClick={() => addBlock("code")}>
              + Code
            </button>
          </div>

          <div className={styles.blocks}>
            {blocks.length === 0 ? (
              <div className={styles.empty}>Add blocks if needed (optional).</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  {blocks.map((b) => (
                    <SortableBlockItem
                      key={b.clientId}
                      id={b.clientId}
                      block={b.data}
                      onChange={(next) => updateBlock(b.clientId, next)}
                      onRemove={() => removeBlock(b.clientId)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={isSubmitting}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

/** Sortable wrapper (adds drag handle + transforms) */
function SortableBlockItem({
  id,
  block,
  onChange,
  onRemove,
}: {
  id: string;
  block: Block;
  onChange: (b: Block) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItem}>
      <div
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        ⋮⋮
      </div>

      <div className={styles.sortableContent}>
        <BlockEditor block={block} onChange={onChange} onRemove={onRemove} />
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.blockCard}>
      <div className={styles.blockHeader}>
        <div className={styles.blockType}>{block.type}</div>
        <button type="button" className={styles.removeBtn} onClick={onRemove}>
          Remove
        </button>
      </div>

      {block.type === "text" && (
        <textarea
          className={styles.textarea}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          onInput={(e) => autoGrow(e.currentTarget)}
          placeholder="Text..."
        />
      )}

      {block.type === "image" && (
        <input
          className={styles.input}
          value={block.imageUrl}
          onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
          placeholder="https://..."
        />
      )}

      {block.type === "checklist" && (
        <textarea
          className={styles.textarea}
          value={block.items.join("\n")}
          onChange={(e) =>
            onChange({
              ...block,
              // Preserve user input while typing (including empty lines)
              items: e.target.value.split("\n"),
            })
          }
          onInput={(e) => autoGrow(e.currentTarget)}
          placeholder={"Each item on a new line\nExample:\nBuy milk\nMake a call"}
        />
      )}

      {block.type === "code" && (
        <div className={styles.codeWrap}>
          <input
            className={styles.input}
            value={block.language}
            onChange={(e) => onChange({ ...block, language: e.target.value })}
            placeholder="Language (js / ts / python...)"
          />
          <textarea
            className={`${styles.textarea} ${styles.codeTextarea}`}
            value={block.codeContent}
            onChange={(e) => onChange({ ...block, codeContent: e.target.value })}
            onInput={(e) => autoGrow(e.currentTarget)}
            placeholder="Code content..."
          />
        </div>
      )}
    </div>
  );
}
