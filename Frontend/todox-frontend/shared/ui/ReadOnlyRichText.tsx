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

type Props = {
  value: string;
  className?: string;
  contentClassName?: string;
};

export function ReadOnlyRichText({ value, className, contentClassName }: Props) {
  const content = useMemo(() => safeParse(value), [value]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
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

  return (
    <div className={className}>
      <div className={contentClassName}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
