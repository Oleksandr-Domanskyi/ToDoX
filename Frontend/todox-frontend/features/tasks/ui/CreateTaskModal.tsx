"use client";

import React, { useMemo, useState } from "react";
import styles from "./CreateTaskModal.module.css";

import type { Block } from "@/shared/types/block";
import type { UpdateTaskRequest } from "@/features/tasks/model/tasks.types";
import { CreateTask } from "@/features/tasks/api/task.api";

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

import type { RichUi } from "./UpdateTaskModal";

type Props = {
	planId: string;
	onClose: () => void;
	onCreated?: () => void | Promise<void>;
};

function makeClientId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `b_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function autoGrow(el: HTMLTextAreaElement) {
	el.style.height = "0px";
	el.style.height = `${el.scrollHeight}px`;
}

function emptyDocJson(): string {
	return JSON.stringify({
		type: "doc",
		content: [{ type: "paragraph", content: [] }],
	});
}

type JsonNode = unknown;
function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readNumber(v: unknown, fallback: number): number {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string") {
		const n = Number(v.trim());
		return Number.isFinite(n) ? n : fallback;
	}
	return fallback;
}

function readPosition(v: unknown): "left" | "right" | "full" {
	if (typeof v !== "string") return "full";
	const s = v.trim().toLowerCase();
	if (s === "left" || s === "l" || s === "0") return "left";
	if (s === "right" || s === "r" || s === "1") return "right";
	if (s === "full" || s === "f" || s === "2") return "full";
	return "full";
}

/**
 * Локальный UI-тип блока.
 * Он гарантирует поле `type`, даже если твой `Block` в проекте не union.
 */
type ChecklistItem = { richTextJson: string; done: boolean };

type UiBlockData =
	| {
			type: "text";
			Row: number;
			Position: "left" | "right" | "full";
			richTextJson: string;
	  }
	| {
			type: "image";
			Row: number;
			Position: "left" | "right" | "full";
			imageUrl: string;
			captionRichTextJson: string;
	  }
	| {
			type: "checklist";
			Row: number;
			Position: "left" | "right" | "full";
			items: ChecklistItem[];
	  }
	| {
			type: "code";
			Row: number;
			Position: "left" | "right" | "full";
			codeContent: string;
			language: string;
	  };

type UiBlock = {
	clientId: string;
	data: UiBlockData;
};

/**
 * Нормализуем UiBlockData -> Block (под backend / normalizeBlocks)
 * Важно: Row/Position/Order в PascalCase.
 */
function normalizeBlockForApi(block: UiBlockData, index: number): Block {
	const Row = readNumber(block.Row, 0);
	const Position = readPosition(block.Position);
	const Order = index;

	if (block.type === "text") {
		return {
			type: "text",
			Row,
			Position,
			Order,
			richTextJson: block.richTextJson || emptyDocJson(),
		} as unknown as Block;
	}

	if (block.type === "image") {
		return {
			type: "image",
			Row,
			Position,
			Order,
			imageUrl: block.imageUrl ?? "",
			captionRichTextJson: block.captionRichTextJson || emptyDocJson(),
		} as unknown as Block;
	}

	if (block.type === "checklist") {
		return {
			type: "checklist",
			Row,
			Position,
			Order,
			items: Array.isArray(block.items) ? block.items : [],
		} as unknown as Block;
	}

	// code
	return {
		type: "code",
		Row,
		Position,
		Order,
		codeContent: block.codeContent ?? "",
		language: block.language ?? "ts",
	} as unknown as Block;
}

export function CreateTaskModal({ planId, onClose, onCreated }: Props) {
	const [title, setTitle] = useState("");
	const [blocks, setBlocks] = useState<UiBlock[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const ids = useMemo(() => blocks.map((b) => b.clientId), [blocks]);

	const richUi = useMemo<RichUi>(
		() => ({
			toolbarClassName: styles.richToolbar,
			buttonClassName: styles.richBtn,
			iconBtnClassName: styles.richIconBtn,
			groupClassName: styles.richGroup,
			separatorClassName: styles.richSep,
			dropdownClassName: styles.richDropdown,
			dropdownMenuClassName: styles.richDropdownMenu,
			surfaceClassName: styles.richSurface,
			contentClassName: styles.richContent,
			placeholderClassName: styles.richPlaceholder,
		}),
		[]
	);

	const addBlock = (type: UiBlockData["type"]) => {
		setBlocks((prev) => {
			const base = { Row: 0, Position: "full" as const };

			let data: UiBlockData;

			if (type === "text") {
				data = { ...base, type: "text", richTextJson: emptyDocJson() };
			} else if (type === "image") {
				data = {
					...base,
					type: "image",
					imageUrl: "",
					captionRichTextJson: emptyDocJson(),
				};
			} else if (type === "checklist") {
				data = { ...base, type: "checklist", items: [] };
			} else {
				data = { ...base, type: "code", codeContent: "", language: "ts" };
			}

			return [...prev, { clientId: makeClientId(), data }];
		});
	};

	const updateBlock = (clientId: string, next: UiBlockData) => {
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

		const trimmed = title.trim();
		if (!trimmed) {
			setError("Please enter a task title.");
			return;
		}

		const normalizedBlocks: Block[] = blocks.map((b, idx) =>
			normalizeBlockForApi(b.data, idx)
		);

		const payload: UpdateTaskRequest = {
			title: trimmed,
			isCompleted: false,
			blocks: normalizedBlocks,
		};

		setIsSubmitting(true);
		try {
			await CreateTask(planId, payload);
			await onCreated?.();
			onClose();
		} catch (e) {
			console.error("CreateTask failed:", e);
			setError("Failed to create task. Please try again.");
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
			}}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<h3 className={styles.title}>New Task</h3>
					<button
						className={styles.closeBtn}
						onClick={onClose}
						aria-label="Close">
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
							<div className={styles.empty}>
								Add blocks if needed (optional).
							</div>
						) : (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={onDragEnd}>
								<SortableContext
									items={ids}
									strategy={verticalListSortingStrategy}>
									{blocks.map((b) => (
										<SortableBlockItem
											key={b.clientId}
											id={b.clientId}
											block={b.data}
											onChange={(next) => updateBlock(b.clientId, next)}
											onRemove={() => removeBlock(b.clientId)}
											richUi={richUi}
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
						Create
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
	block: UiBlockData;
	onChange: (b: UiBlockData) => void;
	onRemove: () => void;
	richUi: RichUi;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.75 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className={styles.sortableItem}>
			<div
				className={styles.dragHandle}
				{...attributes}
				{...listeners}
				title="Drag to reorder">
				⋮⋮
			</div>

			<div className={styles.sortableContent}>
				<BlockEditor
					block={block}
					onChange={onChange}
					onRemove={onRemove}
					richUi={richUi}
				/>
			</div>
		</div>
	);
}

function BlockEditor({
	block,
	onChange,
	onRemove,
	richUi,
}: {
	block: UiBlockData;
	onChange: (b: UiBlockData) => void;
	onRemove: () => void;
	richUi: RichUi;
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
				<RichTextEditor
					value={block.richTextJson}
					onChange={(v) => onChange({ ...block, richTextJson: v })}
					placeholder="Write text..."
					ui={richUi}
				/>
			)}

			{block.type === "image" && (
				<>
					<input
						className={styles.input}
						value={block.imageUrl}
						onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
						placeholder="https://..."
					/>
					<RichTextEditor
						value={block.captionRichTextJson}
						onChange={(v) => onChange({ ...block, captionRichTextJson: v })}
						placeholder="Caption..."
						ui={richUi}
					/>
				</>
			)}

			{block.type === "checklist" && (
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
								title="Remove item">
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
								items: [
									...block.items,
									{ richTextJson: emptyDocJson(), done: false },
								],
							})
						}>
						+ Item
					</button>
				</div>
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
						onChange={(e) =>
							onChange({ ...block, codeContent: e.target.value })
						}
						onInput={(e) => autoGrow(e.currentTarget)}
						placeholder="Code content..."
						spellCheck={false}
					/>
				</div>
			)}
		</div>
	);
}

function tiptapJsonToPlainText(jsonStr: string): string {
	const raw = (jsonStr ?? "").trim();
	if (!raw) return "";
	if (!(raw.startsWith("{") || raw.startsWith("["))) return raw;

	try {
		const doc: JsonNode = JSON.parse(raw);
		const out: string[] = [];

		const walk = (node: JsonNode) => {
			if (!isRecord(node)) return;

			const type = typeof node.type === "string" ? node.type : "";
			const text = typeof node.text === "string" ? node.text : "";

			if (type === "text" && text) out.push(text);

			const content = (node as Record<string, unknown>)["content"];
			if (Array.isArray(content)) {
				for (const child of content) walk(child);
				if (type === "paragraph" || type === "listItem") out.push("\n");
			}
		};

		walk(doc);
		return out
			.join("")
			.replace(/\n{3,}/g, "\n\n")
			.trim();
	} catch {
		return raw;
	}
}

function plainTextToTipTapJson(text: string): string {
	const safe = text ?? "";
	return JSON.stringify({
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: safe ? [{ type: "text", text: safe }] : [],
			},
		],
	});
}
