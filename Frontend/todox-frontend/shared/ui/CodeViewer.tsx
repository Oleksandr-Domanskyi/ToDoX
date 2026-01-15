"use client";

import React, { useMemo } from "react";
import hljs from "highlight.js/lib/core";

// Регистрируем нужные языки (ВАЖНО)
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("json", json);

// алиасы (чтобы ts/js/cs тоже работали)
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("cs", csharp);

type Props = {
	code: string;
	language: string;
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

export function CodeViewer({ code, language }: Props) {
	const html = useMemo(() => {
		const lang = normalizeLang(language);

		try {
			if (lang && hljs.getLanguage(lang)) {
				return hljs.highlight(code ?? "", { language: lang }).value;
			}

			// highlightAuto будет работать корректно только если зарегистрированы языки
			return hljs.highlightAuto(code ?? "", [
				"typescript",
				"javascript",
				"csharp",
				"json",
			]).value;
		} catch {
			return escapeHtml(code ?? "");
		}
	}, [code, language]);

	return (
		<pre
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
			}}>
			<code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
		</pre>
	);
}
