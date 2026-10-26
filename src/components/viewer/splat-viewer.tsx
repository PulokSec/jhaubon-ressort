"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Vec3, type Entity as PcEntity } from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat } from "@playcanvas/react/components";
import { useAppEvent, useSplat } from "@playcanvas/react/hooks";
import { CameraRig } from "./rig";
import type { Space, Viewpoint } from "@/lib/spaces";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { formatNumber } from "@/i18n";

export type SplatViewerProps = {
  space: Space;
  activeId?: string | null;
  onSelect?: (viewpoint: Viewpoint) => void;
  showMarkers?: boolean;
  /** Slow idle sway, used for the homepage hero only. */
  drift?: boolean;
  className?: string;
};

export default function SplatViewer({
  space,
  activeId,
  onSelect,
  showMarkers = true,
  drift = false,
  className,
}: SplatViewerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rig] = useState(() => new CameraRig());
  const markerEls = useRef(new Map<string, HTMLButtonElement>());
  const markerWorld = useMemo(
    () => space.viewpoints.map((v) => ({ id: v.id, world: new Vec3(...(v.marker ?? v.pose.target)) })),
    [space.viewpoints],
  );
  const reducedMotion = useReducedMotion();
  const webgl = useWebGL2();
  const { locale, t } = useI18n();
  const [ready, setReady] = useState(false);

  // Initial pose, then fly to whichever viewpoint becomes active.
  const placed = useRef(false);
  useEffect(() => {
    const vp = space.viewpoints.find((v) => v.id === activeId);
    const pose = vp?.pose ?? space.start;
    if (!pose) return;
    if (!placed.current) {
      rig.setPose(pose);
      placed.current = true;
    } else {
      rig.flyTo(pose, reducedMotion ? 0 : 1.6);
    }
  }, [activeId, space, rig, reducedMotion]);

  useEffect(() => {
    rig.setDrift(drift && !reducedMotion);
  }, [drift, reducedMotion, rig]);

  // Runs inside the PlayCanvas update loop: move the camera, then pin markers to it.
  const onFrame = useCallback(
    (cam: PcEntity, dt: number) => {
      const pose = rig.update(Math.min(dt, 0.1));
      cam.setPosition(pose.position[0], pose.position[1], pose.position[2]);
      scratchTarget.set(pose.target[0], pose.target[1], pose.target[2]);
      cam.lookAt(scratchTarget);
      const camera = cam.camera;
      if (!camera) return;
      for (const m of markerWorld) {
        const el = markerEls.current.get(m.id);
        if (!el) continue;
        camera.worldToScreen(m.world, scratchScreen);
        const behind = scratchScreen.z <= 0;
        el.style.display = behind ? "none" : "inline-flex";
        if (!behind) el.style.transform = `translate(${scratchScreen.x}px, ${scratchScreen.y}px) translate(-14px, -50%)`;
      }
    },
    [rig, markerWorld],
  );
  const onReady = useCallback(() => setReady(true), []);

  // Pointer, wheel and pinch input on the wrapper (markers handle their own clicks).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-marker]")) return;
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const move = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        rig.rotate(e.clientX - prev.x, e.clientY - prev.y);
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) rig.zoom(pinch / d);
        pinch = d;
      }
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      rig.zoom(1 + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) * 0.0015);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [rig]);

  if (!space.splat) return null;

  return (
    <div
      ref={wrapRef}
      data-ready={ready}
      className={cn("relative h-full w-full touch-none select-none overflow-hidden bg-casuarina-deep", className)}
      style={{ cursor: "grab" }}
    >
      {webgl && (
        <Application className="absolute inset-0 block h-full w-full" graphicsDeviceOptions={{ antialias: false }}>
          <SplatScene splat={space.splat} onFrame={onFrame} onReady={onReady} />
        </Application>
      )}

      {/* Poster covers the canvas until the splat has drawn, and stays if 3D isn't available. */}
      {space.poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- plain img: it must sit exactly over the canvas and fade out
        <img
          src={space.poster}
          alt=""
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            ready ? "opacity-0" : "opacity-100",
          )}
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-casuarina-deep transition-opacity duration-700",
            ready ? "opacity-0" : "opacity-100",
          )}
        />
      )}

      {webgl && showMarkers &&
        space.viewpoints.map((v, i) => (
          <button
            key={v.id}
            data-marker
            ref={(el) => {
              if (el) markerEls.current.set(v.id, el);
              else markerEls.current.delete(v.id);
            }}
            type="button"
            onClick={() => onSelect?.(v)}
            className={cn(
              "marker absolute left-0 top-0 hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium shadow-lg outline-none backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-shell",
              v.id === activeId ? "bg-shell text-casuarina" : "bg-casuarina/70 text-shell hover:bg-casuarina/90",
            )}
            aria-label={t.viewer.goTo(v.title)}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-[11px]",
                v.id === activeId ? "bg-wisteria text-white" : "bg-shell/90 text-casuarina",
              )}
            >
              {formatNumber(i + 1, locale)}
            </span>
            {v.title}
          </button>
        ))}

      {!ready && (
        <p role="status" className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-casuarina/80 px-4 py-1.5 text-[13px] text-shell/85 backdrop-blur-md">
          {webgl ? t.viewer.loading : t.viewer.noWebgl}
        </p>
      )}
    </div>
  );
}

function SplatScene({
  splat,
  onFrame,
  onReady,
}: {
  splat: NonNullable<Space["splat"]>;
  onFrame: (cam: PcEntity, dt: number) => void;
  onReady: () => void;
}) {
  const { asset, error } = useSplat(splat.url);
  const camRef = useRef<PcEntity>(null);
  const frames = useRef(0);

  useAppEvent("update", (dt: number) => {
    if (camRef.current) onFrame(camRef.current, dt);
    if (asset && frames.current < 30) {
      frames.current += 1;
      if (frames.current === 30) onReady();
    }
  });

  if (error) return null;

  return (
    <>
      <Entity name="camera" ref={camRef}>
        <Camera clearColor="#14231e" fov={68} nearClip={0.05} farClip={200} />
      </Entity>
      {asset && (
        <Entity name="splat" position={splat.position} rotation={splat.rotation} scale={[splat.scale, splat.scale, splat.scale]}>
          {/* @playcanvas/react defaults unified=false, a deprecated path that no longer draws in engine 2.23 */}
          <GSplat asset={asset} unified />
        </Entity>
      )}
    </>
  );
}

const scratchTarget = new Vec3();
const scratchScreen = new Vec3();

let webgl2Support: boolean | null = null;
function useWebGL2() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (webgl2Support === null) {
        try {
          webgl2Support = !!document.createElement("canvas").getContext("webgl2");
        } catch {
          webgl2Support = false;
        }
      }
      return webgl2Support;
    },
    () => true,
  );
}

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
