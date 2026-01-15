"use client";

import React, { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import type { JSONContent } from "@tiptap/core";

import { createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";
import js from "highlight.js/lib/languages/javascript";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json";

type Props = {
	value: string; // TipTap JSON string
	className?: string;
};

const EMPTY_DOC: JSONContent = {
	type: "doc",
	content: [{ type: "paragraph" }],
};

function safeParseJson(value: string): JSONContent {
	try {
		const v = (value ?? "").trim();
		if (!v) return EMPTY_DOC;

		const parsed = JSON.parse(v) as unknown;
		if (parsed && typeof parsed === "object") return parsed as JSONContent;

		return EMPTY_DOC;
	} catch {
		return EMPTY_DOC;
	}
}

const lowlight = createLowlight();
lowlight.register("typescript", ts);
lowlight.register("ts", ts);
lowlight.register("javascript", js);
lowlight.register("js", js);
lowlight.register("json", json);
lowlight.register("csharp", csharp);
lowlight.register("cs", csharp);
lowlight.register("c#", csharp);
lowlight.register("c-sharp", csharp);

export function RichTextViewer({ value, className }: Props) {
	const content = useMemo(() => safeParseJson(value), [value]);

	const editor = useEditor({
		immediatelyRender: false,
		editable: false,
		extensions: [
			StarterKit.configure({
				codeBlock: false,
				heading: { levels: [1, 2, 3] },
			}),
			CodeBlockLowlight.configure({ lowlight }),
			Underline,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		content,
	});

	useEffect(() => {
		if (!editor) return;

		const next = safeParseJson(value);
		const current = editor.getJSON();

		// сравнение без тяжёлых deepEqual
		const a = JSON.stringify(current);
		const b = JSON.stringify(next);
		if (a !== b) editor.commands.setContent(next, { emitUpdate: false });
	}, [value, editor]);

	if (!editor) return null;

	return (
		<div className={className}>
			<EditorContent editor={editor} />
		</div>
	);
}
