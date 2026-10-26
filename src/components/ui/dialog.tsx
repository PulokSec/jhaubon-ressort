"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

/** Centered dialog, or a right-hand sheet with side="right". */
export function DialogContent({
  className,
  children,
  side = "center",
  ...props
}: React.ComponentProps<typeof D.Content> & { side?: "center" | "right" }) {
  return (
    <D.Portal>
      <D.Overlay className="overlay fixed inset-0 z-40 bg-casuarina-deep/45" />
      <D.Content
        className={cn(
          "fixed z-50 bg-shell text-casuarina shadow-2xl outline-none",
          side === "center" &&
            "pop left-1/2 top-1/2 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-7",
          side === "right" && "sheet inset-y-0 right-0 w-[min(100vw,26rem)] overflow-y-auto p-7 pt-14",
          className,
        )}
        {...props}
      >
        {children}
        <D.Close
          className="absolute right-4 top-4 rounded-full p-2 text-casuarina/70 hover:bg-casuarina/10 hover:text-casuarina focus-visible:outline-2 focus-visible:outline-wisteria"
          aria-label="Close"
        >
          <X className="size-4" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}

export const DialogTitle = ({ className, ...p }: React.ComponentProps<typeof D.Title>) => (
  <D.Title className={cn("font-display text-[1.75rem] leading-tight", className)} {...p} />
);

export const DialogDescription = ({ className, ...p }: React.ComponentProps<typeof D.Description>) => (
  <D.Description className={cn("mt-2 text-[15px] leading-relaxed text-casuarina/75", className)} {...p} />
);
