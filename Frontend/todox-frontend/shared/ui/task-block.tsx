import { Block } from "@/shared/types/block";
import { useLayoutEffect, useMemo, useRef } from "react";
import styles from "../../features/tasks/ui/UpdateTaskModal.module.css";

interface Props {
  block: Block;
}

export function TaskBlock({ block }: Props) {

  switch (block.type) {
    case "text":
      return <p className="whitespace-pre-wrap">{block.content}</p>;

    case "image":
      return (
        <img
          src={block.imageUrl}
          alt=""
          className="max-w-full rounded-md"
        />
      );

    case "checklist":
      return (
        <ul className="list-disc pl-5 space-y-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "code":
      return (
        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
          <code>{block.codeContent}</code>
        </pre>
      );

    default:
      return null;
  }
}


type UpdateProps = {
  block: Block;
  onChange: (next: Block) => void;
};
export function UpdateTaskBlock({ block, onChange }: UpdateProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const valueKey = useMemo(() => {
    switch (block.type) {
      case "text":
        return block.content;
      case "checklist":
        return block.items.join("\n");
      case "code":
        return block.codeContent;
      default:
        return "";
    }
  }, [block]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [valueKey]);

  switch (block.type) {
    case "text":
      return (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={block.content}
          placeholder="Write text..."
          onChange={(e) => onChange({ type: "text", content: e.target.value })}
        />
      );

    case "image":
      return (
        <input
          className={styles.input}
          value={block.imageUrl}
          placeholder="https://..."
          onChange={(e) => onChange({ type: "image", imageUrl: e.target.value })}
        />
      );

    case "checklist":
      return (
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={block.items.join("\n")}
          placeholder={`Each item on a new line\nExample:\nBuy milk\nMake a call`}
          onChange={(e) =>
            onChange({
              type: "checklist",
              items: e.target.value.split("\n"),
            })
          }
        />
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
                type: "code",
                language: e.target.value,
                codeContent: block.codeContent,
              })
            }
          />
          <textarea
            ref={textareaRef}
            className={`${styles.textarea} ${styles.codeTextarea}`}
            value={block.codeContent}
            placeholder="Paste code..."
            onChange={(e) =>
              onChange({
                type: "code",
                language: block.language,
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


