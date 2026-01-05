import { Block } from "@/shared/types/block";

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
