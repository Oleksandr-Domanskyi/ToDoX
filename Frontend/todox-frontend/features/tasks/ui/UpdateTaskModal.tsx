// UpdateTaskModal.tsx
"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./UpdateTaskModal.module.css";

import type { Block, BlockPosition } from "@/shared/types/block";
import type { Task } from "../model/tasks.types";
import { UpdateTask } from "../api/task.api";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
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

type RichUi = {
  toolbarClassName: string;
  buttonClassName: string;
  surfaceClassName: string;
  contentClassName: string;
  placeholderClassName: string;
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

function readNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return fallback;
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function readString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function readType(v: unknown): Block["type"] {
  return v === "text" || v === "image" || v === "checklist" || v === "code" ? v : "text";
}

function getProp(obj: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) if (k in obj) return obj[k];
  return undefined;
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

function patchBlockBase(
  block: Block,
  patch: Partial<{ order: number; Row: number; Position: BlockPosition }>
): Block {
  if (block.type === "text") {
    return {
      type: "text",
      richTextJson: block.richTextJson,
      order: patch.order ?? block.order,
      Row: patch.Row ?? block.Row,
      Position: patch.Position ?? block.Position,
    };
  }
  if (block.type === "image") {
    return {
      type: "image",
      imageUrl: block.imageUrl,
      captionRichTextJson: block.captionRichTextJson,
      order: patch.order ?? block.order,
      Row: patch.Row ?? block.Row,
      Position: patch.Position ?? block.Position,
    };
  }
  if (block.type === "checklist") {
    return {
      type: "checklist",
      items: block.items,
      order: patch.order ?? block.order,
      Row: patch.Row ?? block.Row,
      Position: patch.Position ?? block.Position,
    };
  }
  return {
    type: "code",
    codeContent: block.codeContent,
    language: block.language,
    order: patch.order ?? block.order,
    Row: patch.Row ?? block.Row,
    Position: patch.Position ?? block.Position,
  };
}

function coerceToBlock(raw: unknown, fallbackRow: number, fallbackOrder: number): Block {
  const base: Record<string, unknown> = isRecord(raw) ? raw : {};

  const type = readType(getProp(base, "type", "Type"));
  const order = readNumber(getProp(base, "order", "Order", "index", "Index"), fallbackOrder);
  const Row = readNumber(getProp(base, "Row", "row", "RowIndex", "rowIndex"), fallbackRow);
  const Position = toBlockPosition(getProp(base, "Position", "position", "pos", "Pos"));

  if (type === "text") {
    const richTextJson = readString(
      getProp(base, "richTextJson", "RichTextJson"),
      plainTextToTipTapJson("")
    );
    return { type, order, Row, Position, richTextJson };
  }

  if (type === "image") {
    const imageUrl = readString(getProp(base, "imageUrl", "ImageUrl"), "");
    const captionRichTextJson = readString(
      getProp(base, "captionRichTextJson", "CaptionRichTextJson"),
      plainTextToTipTapJson("")
    );
    return { type, order, Row, Position, imageUrl, captionRichTextJson };
  }

  if (type === "checklist") {
    const itemsRaw = getProp(base, "items", "Items");
    const items =
      Array.isArray(itemsRaw)
        ? itemsRaw
            .map((it) => {
              if (!isRecord(it)) return null;
              const richTextJson = readString(
                getProp(it, "richTextJson", "RichTextJson"),
                plainTextToTipTapJson("")
              );
              const doneV = getProp(it, "done", "Done");
              const done = typeof doneV === "boolean" ? doneV : false;
              return { richTextJson, done };
            })
            .filter((x): x is { richTextJson: string; done: boolean } => x !== null)
        : [];
    return { type, order, Row, Position, items };
  }

  const codeContent = readString(getProp(base, "codeContent", "CodeContent"), "");
  const language = readString(getProp(base, "language", "Language"), "ts");
  return { type, order, Row, Position, codeContent, language };
}

function compactRows(list: UiBlock[]): UiBlock[] {
  const unique = [...new Set(list.map((b) => b.data.Row))].sort((a, b) => a - b);
  const map = new Map<number, number>();
  unique.forEach((r, idx) => map.set(r, idx));

  return list.map((b) => ({
    ...b,
    data: patchBlockBase(b.data, { Row: map.get(b.data.Row) ?? 0 }),
  }));
}

/**
 * Нормализация:
 * - в одном Row либо full, либо left+right
 * - конфликты выталкиваем вниз full
 * - затем compactRows + order в визуальном порядке
 */
function normalizeForRender(list: UiBlock[]): UiBlock[] {
  const ordered = [...list].sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  const byRow = new Map<number, UiBlock[]>();
  for (const b of ordered) {
    const r = b.data.Row;
    const arr = byRow.get(r) ?? [];
    arr.push(b);
    byRow.set(r, arr);
  }

  const rows = [...byRow.keys()].sort((a, b) => a - b);
  let nextRow = rows.length ? Math.max(...rows) + 1 : 0;

  const out: UiBlock[] = [];

  for (const r of rows) {
    const items = byRow.get(r) ?? [];
    if (items.length === 0) continue;

    const fulls = items.filter((x) => x.data.Position === "full");
    const lefts = items.filter((x) => x.data.Position === "left");
    const rights = items.filter((x) => x.data.Position === "right");

    if (fulls.length > 0) {
      const keep = fulls[0];
      out.push({ ...keep, data: patchBlockBase(keep.data, { Row: r, Position: "full" }) });

      const overflow = [...fulls.slice(1), ...lefts, ...rights];
      for (const x of overflow) {
        out.push({ ...x, data: patchBlockBase(x.data, { Row: nextRow++, Position: "full" }) });
      }
      continue;
    }

    const keepLeft = lefts[0] ?? null;
    const keepRight = rights[0] ?? null;

    if (keepLeft) out.push({ ...keepLeft, data: patchBlockBase(keepLeft.data, { Row: r, Position: "left" }) });
    if (keepRight) out.push({ ...keepRight, data: patchBlockBase(keepRight.data, { Row: r, Position: "right" }) });

    const overflow = [...lefts.slice(1), ...rights.slice(1)];
    for (const x of overflow) {
      out.push({ ...x, data: patchBlockBase(x.data, { Row: nextRow++, Position: "full" }) });
    }
  }

  const shaped = compactRows(out);

  const rowSet = [...new Set(shaped.map((b) => b.data.Row))].sort((a, b) => a - b);
  const byRow2 = new Map<number, UiBlock[]>();
  for (const b of shaped) {
    const arr = byRow2.get(b.data.Row) ?? [];
    arr.push(b);
    byRow2.set(b.data.Row, arr);
  }

  const posRank = (p: BlockPosition) => (p === "left" ? 0 : p === "right" ? 1 : 2);

  const visual: UiBlock[] = [];
  for (const r of rowSet) {
    const items = byRow2.get(r) ?? [];
    const sorted = [...items].sort((a, b) => posRank(a.data.Position) - posRank(b.data.Position));
    for (const x of sorted) visual.push(x);
  }

  return visual.map((b, idx) => ({
    ...b,
    data: patchBlockBase(b.data, { order: idx }),
  }));
}

/**
 * ===== DROP SLOTS =====
 * id: slot:<row>:<pos>
 */
type SlotTarget = { row: number; pos: BlockPosition };

function makeSlotId(row: number, pos: BlockPosition) {
  return `slot:${row}:${pos}`;
}

function parseSlotId(id: unknown): SlotTarget | null {
  if (typeof id !== "string") return null;
  if (!id.startsWith("slot:")) return null;

  const parts = id.split(":");
  if (parts.length !== 3) return null;

  const row = Number(parts[1]);
  const pos = toBlockPosition(parts[2]);

  if (!Number.isFinite(row)) return null;
  return { row, pos };
}

function DropField({ id, label, show }: { id: string; label: string; show: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const cls = [
    styles.dropField,
    show ? styles.dropFieldVisible : styles.dropFieldHidden,
    isOver ? styles.dropFieldOver : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} className={cls} aria-hidden="true">
      <div className={styles.dropFieldLabel}>{label}</div>
    </div>
  );
}

function buildInitialUiBlocks(taskBlocks: unknown): UiBlock[] {
  const arr = Array.isArray(taskBlocks) ? taskBlocks : [];
  const base: UiBlock[] = arr.map((b, idx) => ({
    clientId: makeClientId(),
    data: coerceToBlock(b, idx, idx),
  }));

  return normalizeForRender(base);
}

function makeTextBlock(order: number, Row: number, Position: BlockPosition): Block {
  return { type: "text", order, Row, Position, richTextJson: plainTextToTipTapJson("") };
}
function makeImageBlock(order: number, Row: number, Position: BlockPosition): Block {
  return {
    type: "image",
    order,
    Row,
    Position,
    imageUrl: "",
    captionRichTextJson: plainTextToTipTapJson(""),
  };
}
function makeChecklistBlock(order: number, Row: number, Position: BlockPosition): Block {
  return { type: "checklist", order, Row, Position, items: [] };
}
function makeCodeBlock(order: number, Row: number, Position: BlockPosition): Block {
  return { type: "code", order, Row, Position, codeContent: "", language: "ts" };
}

export function UpdateTaskModal({ planId, taskId, Task, onClose }: Props) {
  const [title, setTitle] = useState(Task.title ?? "");
  const [isCompleted, setIsCompleted] = useState(!!Task.isCompleted);

  const [blocks, setBlocks] = useState<UiBlock[]>(() => buildInitialUiBlocks(Task.blocks));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => blocks.map((b) => b.clientId), [blocks]);

  const updatedAtText = useMemo(() => {
    return Task.updatedAt ? new Date(Task.updatedAt).toLocaleString() : "N/A";
  }, [Task.updatedAt]);

  const richUi: RichUi = useMemo(
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
      const maxRow = prev.reduce((m, x) => Math.max(m, x.data.Row), -1);
      const nextRow = maxRow + 1;

      const block: Block =
        type === "text"
          ? makeTextBlock(0, nextRow, "full")
          : type === "image"
          ? makeImageBlock(0, nextRow, "full")
          : type === "checklist"
          ? makeChecklistBlock(0, nextRow, "full")
          : makeCodeBlock(0, nextRow, "full");

      return normalizeForRender([...prev, { clientId: makeClientId(), data: block }]);
    });
  };

  const updateBlock = (id: string, next: Block) => {
    setBlocks((prev) => prev.map((b) => (b.clientId === id ? { ...b, data: next } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => normalizeForRender(prev.filter((b) => b.clientId !== id)));
  };

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(typeof e.active.id === "string" ? e.active.id : null);
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  const applyDropToSlot = (activeClientId: string, slotRow: number, slotPos: BlockPosition) => {
    setBlocks((prev) => {
      const active = prev.find((x) => x.clientId === activeClientId);
      if (!active) return prev;

      const activeRow = active.data.Row;
      const activePos = active.data.Position;

      if (activeRow === slotRow && activePos === slotPos) return prev;

      const findOccupant = (row: number, pos: BlockPosition) =>
        prev.find((b) => b.data.Row === row && b.data.Position === pos) ?? null;

      if (slotPos === "full") {
        const maxRow = prev.reduce((m, b) => Math.max(m, b.data.Row), -1);
        let nextRow = maxRow + 1;

        const moved: UiBlock[] = prev.map((b) => {
          if (b.clientId === activeClientId) {
            return { ...b, data: patchBlockBase(b.data, { Row: slotRow, Position: "full" }) };
          }
          if (b.data.Row === slotRow) {
            return { ...b, data: patchBlockBase(b.data, { Row: nextRow++, Position: "full" }) };
          }
          return b;
        });

        return normalizeForRender(moved);
      }

      const occupant = findOccupant(slotRow, slotPos);

      const targetFull = findOccupant(slotRow, "full");
      if (targetFull && targetFull.clientId !== activeClientId) {
        const swapped: UiBlock[] = prev.map((b) => {
          if (b.clientId === activeClientId) {
            return { ...b, data: patchBlockBase(b.data, { Row: slotRow, Position: "full" }) };
          }
          if (b.clientId === targetFull.clientId) {
            return { ...b, data: patchBlockBase(b.data, { Row: activeRow, Position: activePos }) };
          }
          return b;
        });

        return normalizeForRender(swapped);
      }

      if (!occupant) {
        const moved: UiBlock[] = prev.map((b) => {
          if (b.clientId !== activeClientId) return b;
          return { ...b, data: patchBlockBase(b.data, { Row: slotRow, Position: slotPos }) };
        });

        return normalizeForRender(moved);
      }

      if (occupant.clientId === activeClientId) return prev;

      const swapped: UiBlock[] = prev.map((b) => {
        if (b.clientId === activeClientId) {
          return { ...b, data: patchBlockBase(b.data, { Row: slotRow, Position: slotPos }) };
        }
        if (b.clientId === occupant.clientId) {
          return { ...b, data: patchBlockBase(b.data, { Row: activeRow, Position: activePos }) };
        }
        return b;
      });

      return normalizeForRender(swapped);
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const active = e.active.id;
    const over = e.over?.id;

    setActiveId(null);

    if (typeof active !== "string") return;
    if (!over) return;

    const slot = parseSlotId(over);
    if (slot) {
      applyDropToSlot(active, slot.row, slot.pos);
      return;
    }

    // IMPORTANT: не делаем arrayMove по списку.
    // В двухколоночном grid это ломает layout. Перемещение только через slots.
  };

  const submit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const normalized = normalizeForRender(blocks).map((b) => b.data);

    const payload: TaskDtoPayload = {
      id: taskId,
      planId,
      title: title.trim(),
      isCompleted,
      blocks: normalized,
      createdAt: Task.createdAt,
      updatedAt: Task.updatedAt ?? null,
    };

    setIsSubmitting(true);
    try {
      await UpdateTask(planId, taskId, payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsWithGrid = useMemo(() => {
    const posRank = (p: BlockPosition) => (p === "left" ? 0 : p === "right" ? 1 : 2);

    const safe = blocks.map((b) => {
      const Row = readNumber((b.data as unknown as Record<string, unknown>).Row, 0);
      const Position = toBlockPosition((b.data as unknown as Record<string, unknown>).Position);

      const gridColumn = Position === "full" ? "1 / -1" : Position === "left" ? "1 / 2" : "2 / 3";
      const gridRow = String(Row + 1);

      return {
        ...b,
        __Row: Row,
        __Position: Position,
        gridStyle: { gridColumn, gridRow } as React.CSSProperties,
      };
    });

    safe.sort((a, b) => {
      if (a.__Row !== b.__Row) return a.__Row - b.__Row;
      return posRank(a.__Position) - posRank(b.__Position);
    });

    return safe;
  }, [blocks]);

  const isDragging = activeId !== null;

  const maxRow = useMemo(() => blocks.reduce((m, b) => Math.max(m, b.data.Row), -1), [blocks]);
  const rowCount = Math.max(1, maxRow + 2);

  const gridWrapRef = useRef<HTMLDivElement | null>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const root = gridWrapRef.current;
    if (!root) return;

    const measure = () => {
      const h: number[] = Array.from({ length: rowCount }, () => 0);
      const nodes = root.querySelectorAll<HTMLElement>("[data-row]");
      nodes.forEach((el) => {
        const rowAttr = el.getAttribute("data-row");
        const row = rowAttr ? Number(rowAttr) : NaN;
        if (!Number.isFinite(row)) return;
        const rect = el.getBoundingClientRect();
        h[row] = Math.max(h[row] ?? 0, rect.height);
      });

      for (let i = 0; i < h.length; i++) {
        if (!h[i] || h[i] < 120) h[i] = 140;
      }

      setRowHeights(h);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(root);

    return () => ro.disconnect();
  }, [rowCount, itemsWithGrid.length]);

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
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={onDragStart}
              onDragCancel={onDragCancel}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                {itemsWithGrid.length === 0 ? (
                  <div className={styles.empty}>Add blocks if needed (optional).</div>
                ) : null}

                <div className={styles.blocksGridWrap} ref={gridWrapRef}>
                  <div className={styles.blocksGrid}>
                    {itemsWithGrid.map((b) => (
                      <SortableBlockItem
                        key={b.clientId}
                        id={b.clientId}
                        block={b.data}
                        gridStyle={b.gridStyle}
                        onChange={(next) => updateBlock(b.clientId, next)}
                        onRemove={() => removeBlock(b.clientId)}
                        richUi={richUi}
                      />
                    ))}
                  </div>

                  <div className={styles.dropOverlay} aria-hidden="true">
                    {Array.from({ length: rowCount }, (_, row) => (
                      <div
                        key={`drop-row-${row}`}
                        className={styles.dropRow}
                        style={{
                          gridRow: String(row + 1),
                          height: rowHeights[row] ?? 140,
                        }}
                      >
                        <DropField id={makeSlotId(row, "left")} label="left" show={isDragging} />
                        <DropField id={makeSlotId(row, "full")} label="full" show={isDragging} />
                        <DropField id={makeSlotId(row, "right")} label="right" show={isDragging} />
                      </div>
                    ))}
                  </div>
                </div>
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
  gridStyle,
  onChange,
  onRemove,
  richUi,
}: {
  id: string;
  block: Block;
  gridStyle: React.CSSProperties;
  onChange: (b: Block) => void;
  onRemove: () => void;
  richUi: RichUi;
}) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    ...gridStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    height: "100%",
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItemGrid} data-row={block.Row}>
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
  richUi: RichUi;
}) {
  const codeRef = useRef<HTMLTextAreaElement | null>(null);

  const growKey = useMemo(() => (block.type === "code" ? block.codeContent : ""), [block]);

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
          value={block.captionRichTextJson ?? plainTextToTipTapJson("")}
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
