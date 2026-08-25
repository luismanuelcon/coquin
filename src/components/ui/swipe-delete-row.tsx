"use client";

import { Trash2 } from "lucide-react";
import { type DragEvent, type MouseEvent, type PointerEvent, type ReactNode, type TouchEvent, useRef, useState } from "react";

const actionWidth = 76;
const openThreshold = 38;

type SwipeDeleteRowProps = {
  children: ReactNode;
  deleteLabel: string;
  onDelete: () => void;
};

function isInteractiveTarget(target: EventTarget) {
  return target instanceof HTMLElement && Boolean(target.closest("a, input, select, textarea"));
}

export function SwipeDeleteRow({ children, deleteLabel, onDelete }: SwipeDeleteRowProps) {
  const [offset, setOffset] = useState(0);
  const isOpen = offset <= -openThreshold;
  const dragging = useRef(false);
  const currentOffset = useRef(0);
  const movedDuringGesture = useRef(false);
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

  function beginGesture(clientX: number, clientY: number) {
    dragging.current = true;
    startX.current = clientX;
    startY.current = clientY;
    startOffset.current = currentOffset.current;
    movedDuringGesture.current = false;
  }

  function moveGesture(clientX: number, clientY: number) {
    if (!dragging.current) {
      return;
    }

    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX) + 8) {
      return;
    }

    const nextOffset = Math.min(0, Math.max(-actionWidth, startOffset.current + deltaX));
    movedDuringGesture.current = Math.abs(deltaX) > 10;
    updateOffset(nextOffset);
  }

  function endGesture() {
    if (!dragging.current) {
      return;
    }

    dragging.current = false;
    const shouldOpen = currentOffset.current <= -openThreshold;
    updateOffset(shouldOpen ? -actionWidth : 0);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    if (isInteractiveTarget(event.target)) {
      return;
    }

    beginGesture(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    moveGesture(event.clientX, event.clientY);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    endGesture();
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || isInteractiveTarget(event.target)) {
      return;
    }

    beginGesture(event.clientX, event.clientY);
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (event.buttons !== 1) {
      return;
    }

    moveGesture(event.clientX, event.clientY);
  }

  function handleMouseUp() {
    endGesture();
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target) || event.touches.length !== 1) {
      return;
    }

    beginGesture(event.touches[0].clientX, event.touches[0].clientY);
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      return;
    }

    moveGesture(event.touches[0].clientX, event.touches[0].clientY);

    if (movedDuringGesture.current) {
      event.preventDefault();
    }
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!movedDuringGesture.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    window.setTimeout(() => {
      movedDuringGesture.current = false;
    }, 0);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDelete() {
    close();
    onDelete();
  }

  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      data-swipe-delete-row="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragging.current = false;
        close();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={endGesture}
      onTouchCancel={() => {
        dragging.current = false;
        close();
      }}
      onClickCapture={handleClickCapture}
      onDragStart={handleDragStart}
    >
      <div className="absolute inset-y-0 right-0 flex w-[76px] items-stretch justify-end">
        <button
          type="button"
          onClick={handleDelete}
          className={`grid w-[68px] place-items-center rounded-[18px] bg-[var(--urgent)] text-white ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-label={deleteLabel}
          tabIndex={isOpen ? 0 : -1}
        >
          <Trash2 aria-hidden="true" size={19} strokeWidth={2.5} />
        </button>
      </div>
      <div
        style={{ transform: `translateX(${offset}px)`, touchAction: "pan-y" }}
        className={`relative z-10 select-none ${dragging.current ? "" : "transition-transform duration-200 ease-[var(--ease-standard)]"}`}
      >
        {children}
      </div>
    </div>
  );
}
