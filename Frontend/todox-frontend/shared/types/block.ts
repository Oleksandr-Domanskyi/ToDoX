export type Block =
  | { type: "text"; content: string }
  | { type: "image"; imageUrl: string }
  | { type: "checklist"; items: string[] }
  | { type: "code"; codeContent: string; language: string };