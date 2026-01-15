"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { createLowlight } from "lowlight";

import ts from "highlight.js/lib/languages/typescript";
import js from "highlight.js/lib/languages/javascript";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json";

declare module "highlight.js/lib/languages/typescript";
declare module "highlight.js/lib/languages/javascript";
declare module "highlight.js/lib/languages/csharp";
declare module "highlight.js/lib/languages/json";

export type RichTextUi = {
	toolbarClassName: string;
	buttonClassName: string;
	surfaceClassName: string;
	contentClassName: string;
	placeholderClassName: string;

	groupClassName?: string;
	separatorClassName?: string;
	dropdownClassName?: string;
	dropdownMenuClassName?: string;
	iconBtnClassName?: string;
};

type Props = {
	value: string; // TipTap JSON string
	onChange: (next: string) => void;
	placeholder?: string;
	ui: RichTextUi;
};

const EMPTY_DOC = {
	type: "doc",
	content: [{ type: "paragraph", content: [] }],
};

function safeParse(value: string) {
	try {
		const v = (value ?? "").trim();
		return v ? JSON.parse(v) : EMPTY_DOC;
	} catch {
		return EMPTY_DOC;
	}
}

const lowlight = createLowlight();
lowlight.register("ts", ts);
lowlight.register("js", js);
lowlight.register("csharp", csharp);
lowlight.register("json", json);

type BlockType = "paragraph" | "h1" | "h2" | "h3";
type AlignType = "left" | "center" | "right";

function blockLabel(t: BlockType) {
	if (t === "paragraph") return "Text";
	if (t === "h1") return "Heading 1";
	if (t === "h2") return "Heading 2";
	return "Heading 3";
}

function applyBlockType(
	editor: NonNullable<ReturnType<typeof useEditor>>,
	t: BlockType
) {
	const chain = editor.chain().focus();

	if (t === "paragraph") {
		chain.setParagraph().run();
		return;
	}

	const level = t === "h1" ? 1 : t === "h2" ? 2 : 3;
	chain.toggleHeading({ level }).run();
}

export function RichTextEditor({ value, onChange, placeholder, ui }: Props) {
	const content = useMemo(() => safeParse(value), [value]);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				codeBlock: false,
			}),
			CodeBlockLowlight.configure({ lowlight }),
			Underline,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		content,
		onUpdate({ editor }) {
			onChange(JSON.stringify(editor.getJSON()));
		},
	});

	// keep editor content in sync with outside value
	useEffect(() => {
		if (!editor) return;

		const next = safeParse(value);
		const current = editor.getJSON();

		if (JSON.stringify(current) !== JSON.stringify(next)) {
			editor.commands.setContent(next, { emitUpdate: false });
		}
	}, [value, editor]);

	// ===== toolbar state =====
	const [uiState, setUiState] = useState(() => ({
		bold: false,
		italic: false,
		underline: false,
		align: "left" as AlignType,
		bullet: false,
		ordered: false,
		codeBlock: false,
		block: "paragraph" as BlockType,
	}));

	useEffect(() => {
		if (!editor) return;

		const read = () => {
			const block: BlockType = editor.isActive("heading", { level: 1 })
				? "h1"
				: editor.isActive("heading", { level: 2 })
				? "h2"
				: editor.isActive("heading", { level: 3 })
				? "h3"
				: "paragraph";

			const align: AlignType = editor.isActive({ textAlign: "center" })
				? "center"
				: editor.isActive({ textAlign: "right" })
				? "right"
				: "left";

			setUiState({
				bold: editor.isActive("bold"),
				italic: editor.isActive("italic"),
				underline: editor.isActive("underline"),
				align,
				bullet: editor.isActive("bulletList"),
				ordered: editor.isActive("orderedList"),
				codeBlock: editor.isActive("codeBlock"),
				block,
			});
		};

		read();

		editor.on("selectionUpdate", read);
		editor.on("transaction", read);
		editor.on("update", read);
		editor.on("focus", read);
		editor.on("blur", read);

		return () => {
			editor.off("selectionUpdate", read);
			editor.off("transaction", read);
			editor.off("update", read);
			editor.off("focus", read);
			editor.off("blur", read);
		};
	}, [editor]);

	// ===== dropdown state =====
	const [openType, setOpenType] = useState(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onDown = (e: MouseEvent) => {
			if (!dropdownRef.current) return;
			if (!dropdownRef.current.contains(e.target as Node)) setOpenType(false);
		};
		window.addEventListener("mousedown", onDown);
		return () => window.removeEventListener("mousedown", onDown);
	}, []);

	// close dropdown on ESC
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpenType(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	if (!editor) return null;

	const empty = !editor.getText().trim();

	const groupCls = ui.groupClassName ?? "";
	const sepCls = ui.separatorClassName ?? "";
	const ddCls = ui.dropdownClassName ?? "";
	const ddMenuCls = ui.dropdownMenuClassName ?? "";
	const iconBtnCls = ui.iconBtnClassName ?? ui.buttonClassName;

	const prevent = (e: React.MouseEvent) => e.preventDefault();

	return (
		<div>
			<div className={ui.toolbarClassName}>
				<div className={groupCls}>
					<button
						type="button"
						className={iconBtnCls}
						data-variant="ghost"
						title="Drag (visual)"
						aria-label="Drag"
						tabIndex={-1}
						onMouseDown={prevent}>
						⋮⋮
					</button>
				</div>

				<div className={sepCls} />

				{/* Block type dropdown */}
				<div className={`${groupCls} ${ddCls}`} ref={dropdownRef}>
					<button
						type="button"
						className={iconBtnCls}
						data-active="false"
						data-variant="select"
						onMouseDown={prevent}
						onClick={() => setOpenType((v) => !v)}
						aria-haspopup="menu"
						aria-expanded={openType ? "true" : "false"}
						title="Block type">
						<span data-slot="label">{blockLabel(uiState.block)}</span>
						<span data-slot="chev">▾</span>
					</button>

					{openType ? (
						<div className={ddMenuCls} role="menu">
							{(["paragraph", "h1", "h2", "h3"] as BlockType[]).map((t) => (
								<button
									key={t}
									type="button"
									role="menuitem"
									className={iconBtnCls}
									data-active={uiState.block === t ? "true" : "false"}
									data-variant="menuitem"
									onMouseDown={prevent}
									onClick={() => {
										applyBlockType(editor, t);
										setOpenType(false);
									}}>
									{blockLabel(t)}
								</button>
							))}
						</div>
					) : null}
				</div>

				<div className={sepCls} />

				{/* Inline formatting */}
				<div className={groupCls}>
					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.bold ? "true" : "false"}
						title="Bold"
						aria-label="Bold"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleBold().run()}>
						<b>B</b>
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.italic ? "true" : "false"}
						title="Italic"
						aria-label="Italic"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleItalic().run()}>
						<i>I</i>
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.underline ? "true" : "false"}
						title="Underline"
						aria-label="Underline"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleUnderline().run()}>
						<span style={{ textDecoration: "underline" }}>U</span>
					</button>
				</div>

				<div className={sepCls} />

				{/* Alignment */}
				<div className={groupCls}>
					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.align === "left" ? "true" : "false"}
						title="Align left"
						aria-label="Align left"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().setTextAlign("left").run()}>
						⟸
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.align === "center" ? "true" : "false"}
						title="Align center"
						aria-label="Align center"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().setTextAlign("center").run()}>
						≡
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.align === "right" ? "true" : "false"}
						title="Align right"
						aria-label="Align right"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().setTextAlign("right").run()}>
						⟹
					</button>
				</div>

				<div className={sepCls} />

				{/* Lists + code */}
				<div className={groupCls}>
					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.bullet ? "true" : "false"}
						title="Bullet list"
						aria-label="Bullet list"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleBulletList().run()}>
						••
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.ordered ? "true" : "false"}
						title="Numbered list"
						aria-label="Numbered list"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleOrderedList().run()}>
						1.
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active={uiState.codeBlock ? "true" : "false"}
						title="Code block"
						aria-label="Code block"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
						{"</>"}
					</button>
				</div>

				<div className={sepCls} />

				{/* Right actions */}
				<div className={groupCls} style={{ marginLeft: "auto" }}>
					<button
						type="button"
						className={iconBtnCls}
						data-active="false"
						title="Undo"
						aria-label="Undo"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().undo()}>
						↶
					</button>

					<button
						type="button"
						className={iconBtnCls}
						data-active="false"
						title="Redo"
						aria-label="Redo"
						onMouseDown={prevent}
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().redo()}>
						↷
					</button>
				</div>
			</div>

			<div className={ui.surfaceClassName}>
				<div className={ui.contentClassName}>
					<EditorContent editor={editor} />
				</div>

				{empty && placeholder ? (
					<div className={ui.placeholderClassName}>{placeholder}</div>
				) : null}
			</div>
		</div>
	);
}
