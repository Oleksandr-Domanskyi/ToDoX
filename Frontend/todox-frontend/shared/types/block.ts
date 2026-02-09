// shared/types/block.ts

export type ChecklistItem = {
	richTextJson: string;
	done: boolean;
};

export type BlockPosition = "left" | "right" | "full";

type BaseBlock = {
	id?: string;
	type: "text" | "image" | "checklist" | "code";
	order: number;
	Position: BlockPosition;
	Row: number;
};

export type TextBlock = BaseBlock & {
	type: "text";
	richTextJson: string;
};

export type ImageBlock = BaseBlock & {
	type: "image";
	imageUrl: string;
	captionRichTextJson?: string;
};

export type ChecklistBlock = BaseBlock & {
	type: "checklist";
	items: ChecklistItem[];
};

export type CodeBlock = BaseBlock & {
	type: "code";
	codeContent: string;
	language: string;
};

export type Block = TextBlock | ImageBlock | ChecklistBlock | CodeBlock;
