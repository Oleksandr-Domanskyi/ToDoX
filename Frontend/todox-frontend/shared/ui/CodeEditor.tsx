"use client";

import React, { useEffect, useMemo, useRef } from "react";

import hljs from "highlight.js/lib/core";
import ts from "highlight.js/lib/languages/typescript";
import js from "highlight.js/lib/languages/javascript";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("ts", ts);
hljs.registerLanguage("typescript", ts);
hljs.registerLanguage("js", js);
hljs.registerLanguage("javascript", js);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cs", csharp);
hljs.registerLanguage("json", json);

type Props = {
  value: string;
  language: string; 
  onChange: (next: string) => void;

  className?: string; 
  textareaClassName?: string; 
};

function normalizeLang(raw: string): string {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return "";

  if (v === "c#" || v === "csharp" || v === "cs") return "csharp";
  if (v === "ts" || v === "typescript") return "typescript";
  if (v === "js" || v === "javascript") return "javascript";
  if (v === "json") return "json";

  return v;
}

function escapeHtml(s: string) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "0px";
  el.style.height = `${el.scrollHeight}px`;
}

export function CodeEditor({
  value,
  language,
  onChange,
  className,
  textareaClassName,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (taRef.current) autoGrow(taRef.current);
  }, [value]);

  const highlighted = useMemo(() => {
    const code = value ?? "";
    const lang = normalizeLang(language);

    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return escapeHtml(code);
    }
  }, [value, language]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <pre
        aria-hidden="true"
        style={{
          margin: 0,
          borderRadius: 10,
          border: "1px solid #2b3646",
          background: "#0b0f14",
          padding: "10px 12px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "hidden",
          lineHeight: 1.45,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 13,

          pointerEvents: "none",
        }}
      >
        <code
          className="hljs"
          dangerouslySetInnerHTML={{ __html: highlighted + (value?.endsWith("\n") ? "\n" : "") }}
        />
      </pre>

      <textarea
        ref={taRef}
        className={textareaClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => autoGrow(e.currentTarget)}
        spellCheck={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          color: "transparent",
          caretColor: "#e8edf3",

          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 13,
          lineHeight: 1.45,

          resize: "none",
          overflow: "hidden",
        }}
        placeholder="Code..."
      />
    </div>
  );
}
