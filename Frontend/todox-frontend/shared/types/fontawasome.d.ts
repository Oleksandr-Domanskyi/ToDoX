export {};

declare global {
  interface Window {
    FontAwesomeConfig?: {
      autoReplaceSvg?: "nest" | "replace";
      observeMutations?: boolean;
    };
    FontAwesome?: unknown;
  }
}
