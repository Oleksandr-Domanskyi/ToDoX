"use client";

import React from "react";

import type { Block } from "@/shared/types/block";
import styles from "../../features/tasks/ui/UpdateTaskModal.module.css";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import { RichTextViewer } from "./RichTextViewer";
import { CodeViewer } from "./CodeViewer";



const richUi = {
  toolbarClassName: styles.richToolbar,
  buttonClassName: styles.richBtn,
  surfaceClassName: styles.richSurface,
  contentClassName: styles.richContent,
  placeholderClassName: styles.richPlaceholder,
};


interface Props {
  block: Block;
}


export function TaskBlock({ block }: Props) {
  switch (block.type) {
    case "text":
      return <RichTextViewer value={block.richTextJson} />;

    case "image":
      return (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.imageUrl}
            alt=""
            style={{ width: "100%", height: "auto", borderRadius: 10, display: "block" }}
          />
          {!!block.captionRichTextJson && (
            <div style={{ marginTop: 8 }}>
              <RichTextViewer value={block.captionRichTextJson} />
            </div>
          )}
        </div>
      );

    case "checklist":
      return (
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          {block.items.map((item, i) => (
            <li
              key={i}
              style={{
                opacity: item.done ? 0.65 : 1,
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              <RichTextViewer value={item.richTextJson} />
            </li>
          ))}
        </ul>
      );

    case "code":
      return <CodeViewer code={block.codeContent} language={block.language} />;

    default:
      return null;
  }
}
type UpdateProps = {
  block: Block;
  onChange: (next: Block) => void;
};


export function UpdateTaskBlock({ block, onChange }: UpdateProps) {
  switch (block.type) {
    case "text":
      return (
       <RichTextEditor
        value={block.richTextJson}
        onChange={(v) => onChange({ ...block, richTextJson: v })}
        placeholder="Write text..."
        ui={richUi}
      />
      );

    case "image":
      return (
        <>
          <input
            className={styles.input}
            value={block.imageUrl}
            placeholder="https://..."
            onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
          />

          {"captionRichTextJson" in block ? (
            <RichTextEditor
              value={block.captionRichTextJson ?? ""}
              onChange={(v) => onChange({ ...block, captionRichTextJson: v })}
              placeholder="Caption..."
              ui={richUi}
            />
          ) : null}
        </>
      );

    case "checklist":
      return (
        <div className={styles.checklist}>
          {block.items.map((item, idx) => (
            <div key={idx} className={styles.checklistItem}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={(e) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], done: e.target.checked };
                  onChange({ ...block, items });
                }}
              />

              <div className={styles.checklistEditor}>
                <RichTextEditor
                  value={item.richTextJson}
                  onChange={(v) => {
                    const items = [...block.items];
                    items[idx] = { ...items[idx], richTextJson: v };
                    onChange({ ...block, items });
                  }}
                  placeholder="Checklist item..."
                  ui={richUi}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className={styles.addItemBtn}
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { richTextJson: "", done: false }],
              })
            }
          >
            + Item
          </button>
        </div>
      );

    case "code":
      return (
        <div className={styles.codeWrap}>
          <input
            className={styles.input}
            value={block.language}
            placeholder="Language (e.g. ts, js)"
            onChange={(e) =>
              onChange({
                ...block,
                language: e.target.value,
              })
            }
          />

          <textarea
            className={`${styles.textarea} ${styles.codeTextarea}`}
            value={block.codeContent}
            placeholder="Paste code..."
            onChange={(e) =>
              onChange({
                ...block,
                codeContent: e.target.value,
              })
            }
          />
        </div>
      );

    default:
      return null;
  }
}
