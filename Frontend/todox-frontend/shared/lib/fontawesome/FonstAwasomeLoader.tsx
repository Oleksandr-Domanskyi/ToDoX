"use client";

import { useEffect } from "react";

const KIT_SRC = "https://kit.fontawesome.com/79e80c61dd.js";

export function FontAwesomeLoader() {
  useEffect(() => {

    window.FontAwesomeConfig = {
      autoReplaceSvg: "nest",
      observeMutations: true,
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${KIT_SRC}"]`
    );
    if (existing) return;


    const script = document.createElement("script");
    script.src = KIT_SRC;
    script.crossOrigin = "anonymous";
    script.async = false;

    document.head.appendChild(script);
  }, []);

  return null;
}
