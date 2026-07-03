"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/** SSR-safe wrapper around Framer Motion's useReducedMotion (defaults to false on the server). */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
