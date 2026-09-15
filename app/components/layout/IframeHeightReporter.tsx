"use client";

import { useEffect } from "react";

export default function IframeHeightReporter() {
  useEffect(() => {
    if (window.parent === window) return;

    const sendHeight = () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      window.parent.postMessage(
        {
          type: "codexmattrix-iframe-height",
          height,
        },
        "*"
      );
    };

    sendHeight();

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);

    const interval = window.setInterval(sendHeight, 1000);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
