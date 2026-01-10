"use client";

import React, { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
  value: string; 
  className?: string;
};

const EMPTY_DOC_OBJ = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function safeParseJson(value: string): Record<string, unknown> {
  try {
    const v = (value ?? "").trim();
    if (!v) return EMPTY_DOC_OBJ;
    const parsed: unknown = JSON.parse(v);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return EMPTY_DOC_OBJ;
  } catch {
    return EMPTY_DOC_OBJ;
  }
}

export function RichTextViewer({ value, className }: Props) {
  const content = useMemo(() => safeParseJson(value), [value]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
  });

  useEffect(() => {
    if (!editor) return;
    const next = safeParseJson(value);
    const current = editor.getJSON();

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
