"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./UpdateTaskModal.module.css";

import type { Block } from "@/shared/types/block";
import type { Task } from "../model/tasks.types";
import { UpdateTask } from "../api/task.api";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";

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



function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "0px";
  el.style.height = `${el.scrollHeight}px`;
}

function makeClientId() {
  return crypto.randomUUID();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function plainTextToTipTapJson(text: string): string {
  const doc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
  return JSON.stringify(doc);
}

function tiptapJsonToPlainText(jsonStr: string): string {
  const raw = (jsonStr ?? "").trim();
  if (!raw) return "";

  if (!(raw.startsWith("{") || raw.startsWith("["))) return raw;

  try {
    const doc: unknown = JSON.parse(raw);
    const out: string[] = [];

    const walk = (node: unknown) => {
      if (!node) return;
      if (!isRecord(node)) return;

      const type = typeof node.type === "string" ? node.type : "";
      const text = typeof node.text === "string" ? node.text : "";

      if (type === "text" && text) out.push(text);

      const content = node.content;
      if (Array.isArray(content)) {
        for (const child of content) walk(child);

        if (type === "paragraph" || type === "heading" || type === "listItem") {
          out.push("\n");
        }
      }
    };

    walk(doc);

    return out.join("").replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return raw;
  }
}


function renumberOrders(list: UiBlock[]): UiBlock[] {
  return list.map((x, idx) => ({
    ...x,
    data: { ...x.data, order: idx },
  }));
}


export function UpdateTaskModal({ planId, taskId, Task, onClose }: Props) {
  const [title, setTitle] = useState(Task.title ?? "");
  const [isCompleted, setIsCompleted] = useState(!!Task.isCompleted);


  const [blocks, setBlocks] = useState<UiBlock[]>(
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

  const richUi = useMemo(
    () => ({
      toolbarClassName: styles.richToolbar,
      buttonClassName: styles.richBtn,
      surfaceClassName: styles.richSurface,
      contentClassName: styles.richContent,
      placeholderClassName: styles.richPlaceholder,
    }),
    []
  );

  const addBlock = (type: Block["type"]) => {
    setBlocks((prev) => {

      const order = prev.length;

      const block: Block =
        type === "text"
          ? { type: "text", richTextJson: plainTextToTipTapJson(""), order }
          : type === "image"
          ? {
              type: "image",
              imageUrl: "",
              captionRichTextJson: plainTextToTipTapJson(""),
              order,
            }
          : type === "checklist"
          ? { type: "checklist", items: [], order }
          : { type: "code", codeContent: "", language: "ts", order };



      return [...prev, { clientId: makeClientId(), data: block }];
    });
  };

  const updateBlock = (id: string, next: Block) => {
    setBlocks((prev) =>
      prev.map((b) => (b.clientId === id ? { ...b, data: next } : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.clientId !== id);
      return renumberOrders(filtered);
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;

    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.clientId === e.active.id);
      const to = prev.findIndex((b) => b.clientId === e.over!.id);
      if (from < 0 || to < 0) return prev;

      const moved = arrayMove(prev, from, to);


      return renumberOrders(moved);
    });
  };

  const submit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const blocksNormalized = renumberOrders(blocks).map((b) => b.data);

    const payload: TaskDtoPayload = {
      id: taskId,
      planId,
      title: title.trim(),
      isCompleted,
      blocks: blocksNormalized,
      createdAt: Task.createdAt,
      updatedAt: Task.updatedAt ?? null,
    };

    setIsSubmitting(true);
    try {
      await UpdateTask(planId, taskId, payload);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to update task");
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {blocks.length === 0 ? (
                  <div className={styles.empty}>Add blocks if needed (optional).</div>
                ) : (
                  blocks.map((b) => (
                    <SortableBlockItem
                      key={b.clientId}
                      id={b.clientId}
                      block={b.data}
                      onChange={(next) => updateBlock(b.clientId, next)}
                      onRemove={() => removeBlock(b.clientId)}
                      richUi={richUi}
                    />
                  ))
                )}
              </SortableContext>
            </DndContext>
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


function SortableBlockItem({
  id,
  block,
  onChange,
  onRemove,
  richUi,
}: {
  id: string;
  block: Block;
  onChange: (b: Block) => void;
  onRemove: () => void;
  richUi: {
    toolbarClassName: string;
    buttonClassName: string;
    surfaceClassName: string;
    contentClassName: string;
    placeholderClassName: string;
  };
}) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItem}>
      <div className={styles.dragHandle} {...attributes} {...listeners} title="Drag to reorder">
        ⋮⋮
      </div>

      <div className={styles.sortableContent}>
        <div className={styles.blockCard}>
          <div className={styles.blockHeader}>
            <div className={styles.blockType}>{block.type}</div>
            <button type="button" className={styles.removeBtn} onClick={onRemove}>
              Remove
            </button>
          </div>

          <BlockEditor block={block} onChange={onChange} richUi={richUi} />
        </div>
      </div>
    </div>
  );
}


function BlockEditor({
  block,
  onChange,
  richUi,
}: {
  block: Block;
  onChange: (b: Block) => void;
  richUi: {
    toolbarClassName: string;
    buttonClassName: string;
    surfaceClassName: string;
    contentClassName: string;
    placeholderClassName: string;
  };
}) {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);

  const growKey = useMemo(() => {
    if (block.type === "code") return block.codeContent;
    return "";
  }, [block]);

  useLayoutEffect(() => {
    if (block.type !== "code") return;
    if (!codeRef.current) return;
    autoGrow(codeRef.current);
  }, [block.type, growKey]);

  if (block.type === "text") {
    return (
      <RichTextEditor
        value={block.richTextJson}
        onChange={(v) => onChange({ ...block, richTextJson: v })}
        placeholder="Write text..."
        ui={richUi}
      />
    );
  }

  if (block.type === "image") {
    return (
      <>
        <input
          className={styles.input}
          value={block.imageUrl}
          onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
          placeholder="https://..."
        />

        <RichTextEditor
          value={block.captionRichTextJson ?? ""}
          onChange={(v) => onChange({ ...block, captionRichTextJson: v })}
          placeholder="Caption..."
          ui={richUi}
        />
      </>
    );
  }

  if (block.type === "checklist") {
    return (
      <div className={styles.checklist}>
        {block.items.map((item, idx) => (
          <div key={idx} className={styles.checklistRow}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) => {
                const items = [...block.items];
                items[idx] = { ...items[idx], done: e.target.checked };
                onChange({ ...block, items });
              }}
            />

            <input
              className={styles.checklistInput}
              value={tiptapJsonToPlainText(item.richTextJson)}
              placeholder="Checklist item..."
              onChange={(e) => {
                const items = [...block.items];
                items[idx] = {
                  ...items[idx],
                  richTextJson: plainTextToTipTapJson(e.target.value),
                };
                onChange({ ...block, items });
              }}
            />

            <button
              type="button"
              className={styles.checklistRemove}
              onClick={() => {
                const items = block.items.filter((_, i) => i !== idx);
                onChange({ ...block, items });
              }}
              aria-label="Remove item"
              title="Remove item"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className={styles.addItemBtn}
          onClick={() =>
            onChange({
              ...block,
              items: [...block.items, { richTextJson: plainTextToTipTapJson(""), done: false }],
            })
          }
        >
          + Item
        </button>
      </div>
    );
  }
  return (
    <div className={styles.codeWrap}>
      <input
        className={styles.input}
        value={block.language}
        onChange={(e) => onChange({ ...block, language: e.target.value })}
        placeholder="Language (js / ts / csharp...)"
      />

      <textarea
        ref={codeRef}
        className={`${styles.textarea} ${styles.codeTextarea}`}
        value={block.codeContent}
        onChange={(e) => onChange({ ...block, codeContent: e.target.value })}
        onInput={(e) => autoGrow(e.currentTarget)}
        placeholder="Code..."
        spellCheck={false}
      />
    </div>
  );
}
