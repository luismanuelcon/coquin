"use client";

import { Trash2 } from "lucide-react";
import { type PointerEvent, type ReactNode, useRef, useState } from "react";

const actionWidth = 76;
const openThreshold = 38;

type SwipeDeleteRowProps = {
  children: ReactNode;
  deleteLabel: string;
  onDelete: () => void;
};

function isInteractiveTarget(target: EventTarget) {
  return target instanceof HTMLElement && Boolean(target.closest("button, a, input, select, textarea"));
}

export function SwipeDeleteRow({ children, deleteLabel, onDelete }: SwipeDeleteRowProps) {
  const [offset, setOffset] = useState(0);
  const dragging = useRef(false);
  const currentOffset = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);

  function updateOffset(nextOffset: number) {
    currentOffset.current = nextOffset;
    setOffset(nextOffset);
  }

  function close() {
    updateOffset(0);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    dragging.current = true;
    startX.current = event.clientX;
    startY.current = event.clientY;
    startOffset.current = currentOffset.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) {
      return;
    }

    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX) + 8) {
      return;
    }

    const nextOffset = Math.min(0, Math.max(-actionWidth, startOffset.current + deltaX));
    updateOffset(nextOffset);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) {
      return;
    }

    dragging.current = false;
    const shouldOpen = currentOffset.current <= -openThreshold;
    updateOffset(shouldOpen ? -actionWidth : 0);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleDelete() {
    close();
    onDelete();
  }

  return (
    <div className="relative overflow-hidden rounded-[20px]">
      <div className="absolute inset-y-0 right-0 flex w-[76px] items-stretch justify-end">
        <button
          type="button"
          onClick={handleDelete}
          className="grid w-[68px] place-items-center rounded-[18px] bg-[var(--urgent)] text-white"
          aria-label={deleteLabel}
          tabIndex={offset <= -openThreshold ? 0 : -1}
        >
          <Trash2 aria-hidden="true" size={19} strokeWidth={2.5} />
        </button>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragging.current = false;
          close();
        }}
        style={{ transform: `translateX(${offset}px)`, touchAction: "pan-y" }}
        className="relative transition-transform duration-200 ease-[var(--ease-standard)]"
      >
        {children}
      </div>
    </div>
  );
}
