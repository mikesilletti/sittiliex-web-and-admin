"use client";

import { useSyncExternalStore } from "react";

/**
 * Viewport height in px that stays fixed while mobile browser toolbars
 * show/hide. iOS Safari and in-app browsers (Facebook, Instagram) fire
 * `resize` with a new innerHeight every time the address bar collapses; any
 * section sized from that height changes the page length mid-scroll and the
 * content below it jumps. On touch devices this only re-measures when the
 * width changes (rotation); on desktop it follows every resize.
 *
 * Returns null during SSR/hydration — callers fall back to CSS `svh`.
 */

let stableHeight: number | null = null;
let lastWidth = 0;
const listeners = new Set<() => void>();

function measure() {
  stableHeight = window.innerHeight;
  lastWidth = window.innerWidth;
}

function onResize() {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch && window.innerWidth === lastWidth) return;
  measure();
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  if (listeners.size === 0) window.addEventListener("resize", onResize);
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) window.removeEventListener("resize", onResize);
  };
}

function getSnapshot() {
  if (stableHeight === null) measure();
  return stableHeight;
}

function getServerSnapshot() {
  return null;
}

export function useStableViewportHeight(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
