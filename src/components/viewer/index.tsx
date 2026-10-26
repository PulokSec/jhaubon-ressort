"use client";

import dynamic from "next/dynamic";

/** PlayCanvas needs window + WebGL, so the viewer only ever renders on the client. */
export const SplatViewer = dynamic(() => import("./splat-viewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-casuarina-deep" />,
});
