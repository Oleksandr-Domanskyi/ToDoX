"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./UpdateTaskModal.module.css";

import type { Block } from "@/shared/types/block";
import type { Task } from "../model/tasks.types";
import { UpdateTask } from "../api/task.api";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import { ReadOnlyRichText } from "@/shared/ui/ReadOnlyRichText";

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
	arrayMove,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
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
	task: Task;
	onSaved?: () => void;
};

type UiBlock = { clientId: string; data: Block };

export type RichUi = {
	toolbarClassName: string;
	buttonClassName: string;
	surfaceClassName: string;
	contentClassName: string;
	placeholderClassName: string;
};

function makeClientId() {
	return crypto.randomUUID();
}

/* ===== TipTap helpers ===== */
function plainTextToTipTapJson(text: string): string {
	return JSON.stringify({
		type: "doc",
		content: [
			{ type: "paragraph", content: text ? [{ type: "text", text }] : [] },
		],
	});
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown, fallback: string): string {
	return typeof v === "string" ? v : fallback;
}

function readNumber(v: unknown, fallback: number): number {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string") {
		const s = v.trim();
		const n = Number(s);
		return Number.isFinite(n) ? n : fallback;
	}
	return fallback;
}

function readType(v: unknown): Block["type"] {
	return v === "text" || v === "image" || v === "checklist" || v === "code" ?
			v
		:	"text";
}

function coerceToBlock(raw: unknown, fallbackOrder: number): Block {
	const o = isRecord(raw) ? raw : {};
	const type = readType(o.type);
	const order = readNumber(o.order, fallbackOrder);

	const Row = readNumber(o.Row, order);
	const Position =
		o.Position === "left" || o.Position === "right" || o.Position === "full" ?
			o.Position
		:	"full";

	if (type === "text") {
		return {
			type,
			order,
			Row,
			Position,
			richTextJson: readString(o.richTextJson, plainTextToTipTapJson("")),
		};
	}

	if (type === "image") {
		return {
			type,
			order,
			Row,
			Position,
			imageUrl: readString(o.imageUrl, ""),
			captionRichTextJson: readString(
				o.captionRichTextJson,
				plainTextToTipTapJson(""),
			),
		};
	}

	if (type === "checklist") {
		const itemsRaw = o.items;
		const items =
			Array.isArray(itemsRaw) ?
				itemsRaw
					.map((it) => {
						if (!isRecord(it)) return null;
						return {
							richTextJson: readString(
								it.richTextJson,
								plainTextToTipTapJson(""),
							),
							done: typeof it.done === "boolean" ? it.done : false,
						};
					})
					.filter(
						(x): x is { richTextJson: string; done: boolean } => x !== null,
					)
			:	[];
		return { type, order, Row, Position, items };
	}

	return {
		type: "code",
		order,
		Row,
		Position,
		codeContent: readString(o.codeContent, ""),
		language: readString(o.language, "ts"),
	};
}

function buildInitialUiBlocks(taskBlocks: unknown): UiBlock[] {
	const arr = Array.isArray(taskBlocks) ? taskBlocks : [];
	const ui: UiBlock[] = arr.map((b, idx) => ({
		clientId: makeClientId(),
		data: coerceToBlock(b, idx),
	}));
	ui.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
	return normalizeOrders(ui);
}

function normalizeOrders(list: UiBlock[]): UiBlock[] {
	return list.map((b, idx) => ({
		...b,
		data: { ...b.data, order: idx, Row: idx } as Block,
	}));
}

function makeTextBlock(order: number): Block {
	return {
		type: "text",
		order,
		Row: order,
		Position: "full",
		richTextJson: plainTextToTipTapJson(""),
	};
}
function makeImageBlock(order: number): Block {
	return {
		type: "image",
		order,
		Row: order,
		Position: "full",
		imageUrl: "",
		captionRichTextJson: plainTextToTipTapJson(""),
	};
}
function makeChecklistBlock(order: number): Block {
	return { type: "checklist", order, Row: order, Position: "full", items: [] };
}
function makeCodeBlock(order: number): Block {
	return {
		type: "code",
		order,
		Row: order,
		Position: "full",
		codeContent: "",
		language: "ts",
	};
}

function fingerprint(title: string, done: boolean, blocks: UiBlock[]) {
	return JSON.stringify({
		title: title.trim(),
		done,
		blocks: blocks.map((b) => b.data),
	});
}

export function UpdateTaskModal({ planId, taskId, task, onSaved }: Props) {
	const [title, setTitle] = useState(task.title ?? "");
	const [isCompleted, setIsCompleted] = useState(!!task.isCompleted);
	const [blocks, setBlocks] = useState<UiBlock[]>(() =>
		buildInitialUiBlocks(task.blocks),
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const ids = useMemo(() => blocks.map((b) => b.clientId), [blocks]);

	const updatedAtText = useMemo(() => {
		return task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A";
	}, [task.updatedAt]);

	const richUi: RichUi = useMemo(
		() => ({
			toolbarClassName: styles.rteToolbar,
			buttonClassName: styles.rteBtn,
			surfaceClassName: styles.rteSurface,
			contentClassName: styles.rteContent,
			placeholderClassName: styles.rtePlaceholder,
		}),
		[],
	);

	const initialRef = useRef(
		fingerprint(
			task.title ?? "",
			!!task.isCompleted,
			buildInitialUiBlocks(task.blocks),
		),
	);
	const dirty = useMemo(
		() => initialRef.current !== fingerprint(title, isCompleted, blocks),
		[title, isCompleted, blocks],
	);

	const addBlock = (type: Block["type"]) => {
		setBlocks((prev) => {
			const nextOrder = prev.length;
			const next =
				type === "text" ? makeTextBlock(nextOrder)
				: type === "image" ? makeImageBlock(nextOrder)
				: type === "checklist" ? makeChecklistBlock(nextOrder)
				: makeCodeBlock(nextOrder);

			return normalizeOrders([
				...prev,
				{ clientId: makeClientId(), data: next },
			]);
		});
	};

	const updateBlock = (id: string, next: Block) => {
		setBlocks((prev) =>
			prev.map((b) => (b.clientId === id ? { ...b, data: next } : b)),
		);
	};

	const removeBlock = (id: string) => {
		setBlocks((prev) => normalizeOrders(prev.filter((b) => b.clientId !== id)));
	};

	const onDragEnd = (e: DragEndEvent) => {
		const { active, over } = e;
		if (!over || active.id === over.id) return;

		setBlocks((prev) => {
			const oldIndex = prev.findIndex((b) => b.clientId === active.id);
			const newIndex = prev.findIndex((b) => b.clientId === over.id);
			if (oldIndex < 0 || newIndex < 0) return prev;
			return normalizeOrders(arrayMove(prev, oldIndex, newIndex));
		});
	};

	const submit = async () => {
		setError(null);
		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		const normalized = normalizeOrders(blocks).map((b) => b.data);

		const payload: TaskDtoPayload = {
			id: taskId,
			planId,
			title: title.trim(),
			isCompleted,
			blocks: normalized,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt ?? null,
		};

		setIsSubmitting(true);
		try {
			await UpdateTask(planId, taskId, payload);
			initialRef.current = fingerprint(title, isCompleted, blocks);
			onSaved?.();
		} catch (err) {
			console.error(err);
			setError("Failed to update task");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className={styles.panel}>
			<header className={styles.panelHeader}>
				<div>
					<h3 className={styles.hTitle}>Edit Task</h3>
					<div className={styles.hMeta}>Last updated: {updatedAtText}</div>
				</div>

				<div className={styles.hRight}>
					{dirty ?
						<div className={styles.hDirty}>• Unsaved changes</div>
					:	null}
					<button
						className={styles.primaryBtn}
						onClick={submit}
						disabled={isSubmitting || !dirty}
						type="button">
						Save changes
					</button>
				</div>
			</header>

			<div className={styles.formRow}>
				<label className={styles.label}>
					Title
					<input
						className={styles.input}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</label>

				<label className={styles.checkRow}>
					<input
						type="checkbox"
						checked={isCompleted}
						onChange={(e) => setIsCompleted(e.target.checked)}
					/>
					<span>Completed</span>
				</label>
			</div>

			<div className={styles.blocksShell}>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={onDragEnd}>
					<SortableContext items={ids} strategy={verticalListSortingStrategy}>
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

				<div className={styles.addRow}>
					<button
						className={styles.addMainBtn}
						onClick={() => addBlock("text")}
						type="button">
						+ Add block
					</button>

					<div className={styles.addQuick}>
						<button
							className={styles.addBtn}
							onClick={() => addBlock("text")}
							type="button">
							Text
						</button>
						<button
							className={styles.addBtn}
							onClick={() => addBlock("image")}
							type="button">
							Image
						</button>
						<button
							className={styles.addBtn}
							onClick={() => addBlock("checklist")}
							type="button">
							Checklist
						</button>
						<button
							className={styles.addBtn}
							onClick={() => addBlock("code")}
							type="button">
							Code
						</button>
					</div>
				</div>

				{error ?
					<div className={styles.error}>{error}</div>
				:	null}
			</div>
		</section>
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
	richUi: RichUi;
}) {
	const {
		setNodeRef,
		transform,
		transition,
		attributes,
		listeners,
		isDragging,
	} = useSortable({ id });
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!isEditing) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsEditing(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isEditing]);

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.75 : 1,
	};

	const typeLabel =
		block.type === "text" ? "Text"
		: block.type === "image" ? "Image Block"
		: block.type === "checklist" ? "Checklist"
		: "Code";

	return (
		<div ref={setNodeRef} style={style} className={styles.blockRow}>
			<div
				className={styles.dragRail}
				{...attributes}
				{...listeners}
				title="Drag">
				⋮⋮
			</div>

			<div
				className={styles.blockCard}
				onMouseDown={() => !isEditing && setIsEditing(true)}>
				<div className={styles.blockHeader}>
					<div className={styles.blockTypePill}>{typeLabel}</div>

					<div className={styles.blockActions}>
						<button
							type="button"
							className={styles.iconBtn}
							onMouseDown={(e) => e.stopPropagation()}
							onClick={() => setIsEditing((v) => !v)}
							title={isEditing ? "Done" : "Edit"}>
							{isEditing ? "✓" : "✎"}
						</button>

						<button
							type="button"
							className={styles.iconBtnDanger}
							onMouseDown={(e) => e.stopPropagation()}
							onClick={onRemove}
							title="Remove">
							🗑
						</button>
					</div>
				</div>

				{!isEditing ?
					<BlockPreview block={block} />
				:	<BlockEditor block={block} onChange={onChange} richUi={richUi} />}
			</div>
		</div>
	);
}

function BlockPreview({ block }: { block: Block }) {
	if (block.type === "text") {
		return (
			<ReadOnlyRichText
				value={block.richTextJson}
				className={styles.previewRte}
				contentClassName={styles.previewRteContent}
			/>
		);
	}

	if (block.type === "image") {
		return (
			<div className={styles.previewImageRow}>
				<div className={styles.previewImageBox}>
					{block.imageUrl ?
						// eslint-disable-next-line @next/next/no-img-element
						<img src={block.imageUrl} alt="" />
					:	<div className={styles.muted}>No image</div>}
				</div>

				<div className={styles.previewCaption}>
					<ReadOnlyRichText
						value={block.captionRichTextJson ?? plainTextToTipTapJson("")}
						className={styles.previewRte}
						contentClassName={styles.previewRteContent}
					/>
				</div>
			</div>
		);
	}

	if (block.type === "checklist") {
		return (
			<ul className={styles.previewChecklist}>
				{block.items.length === 0 ?
					<li className={styles.muted}>No items</li>
				:	null}
				{block.items.map((it, idx) => (
					<li key={idx} className={styles.previewChecklistItem}>
						<span className={styles.checkboxGlyph}>{it.done ? "☑" : "☐"}</span>
						<span className={it.done ? styles.done : ""}></span>
					</li>
				))}
			</ul>
		);
	}

	return (
		<>
			<div className={styles.codeMeta}>{block.language || "code"}</div>
			<pre className={styles.codePreview}>{block.codeContent || "…"}</pre>
		</>
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
	if (block.type === "text") {
		return (
			<RichTextEditor
				value={block.richTextJson}
				onChange={(v) => onChange({ ...block, richTextJson: v })}
				placeholder="Write…"
				ui={richUi}
			/>
		);
	}

	if (block.type === "image") {
		return (
			<div className={styles.imageEdit}>
				<input
					className={styles.input}
					value={block.imageUrl}
					onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
					placeholder="https://…"
				/>
				<RichTextEditor
					value={block.captionRichTextJson ?? plainTextToTipTapJson("")}
					onChange={(v) => onChange({ ...block, captionRichTextJson: v })}
					placeholder="Optional caption…"
					ui={richUi}
				/>
			</div>
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
							value={""}
							onChange={(e) => {
								const items = [...block.items];
								items[idx] = {
									...items[idx],
									richTextJson: plainTextToTipTapJson(e.target.value),
								};
								onChange({ ...block, items });
							}}
							placeholder="Item…"
						/>
						<button
							className={styles.smallDanger}
							onClick={() =>
								onChange({
									...block,
									items: block.items.filter((_, i) => i !== idx),
								})
							}
							title="Remove"
							type="button">
							✕
						</button>
					</div>
				))}
				<button
					type="button"
					className={styles.addBtn}
					onClick={() =>
						onChange({
							...block,
							items: [
								...block.items,
								{ richTextJson: plainTextToTipTapJson(""), done: false },
							],
						})
					}>
					+ Item
				</button>
			</div>
		);
	}

	return (
		<div className={styles.codeEdit}>
			<input
				className={styles.input}
				value={block.language}
				onChange={(e) => onChange({ ...block, language: e.target.value })}
				placeholder="Language…"
			/>
			<textarea
				className={styles.codeArea}
				value={block.codeContent}
				onChange={(e) => onChange({ ...block, codeContent: e.target.value })}
				placeholder="Code…"
				spellCheck={false}
			/>
		</div>
	);
}
