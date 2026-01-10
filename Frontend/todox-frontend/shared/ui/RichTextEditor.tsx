"use client";

import React, { useEffect, useMemo } from "react";
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
};

type Props = {
  value: string; // TipTap JSON string
  onChange: (next: string) => void;
  placeholder?: string;
  ui: RichTextUi;
};

const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
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

export function RichTextEditor({ value, onChange, placeholder, ui }: Props) {
  const content = useMemo(() => safeParse(value), [value]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, 
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const next = safeParse(value);
    const current = editor.getJSON();

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const empty = !editor.getText().trim();

  return (
    <div>
      <div className={ui.toolbarClassName}>
        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("bold") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("italic") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("underline") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive({ textAlign: "left" }) ? "true" : "false"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          Left
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive({ textAlign: "center" }) ? "true" : "false"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          Center
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive({ textAlign: "right" }) ? "true" : "false"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          Right
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("bulletList") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("orderedList") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>

        <button
          type="button"
          className={ui.buttonClassName}
          data-active={editor.isActive("codeBlock") ? "true" : "false"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </button>
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
