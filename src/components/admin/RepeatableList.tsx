"use client";

import type { ReactNode } from "react";

/**
 * Generic add/remove/reorder wrapper for array-of-object content fields
 * (FAQ items, process steps, industries, etc.). The caller owns the array
 * state and supplies `renderItem`; this component only handles the
 * add/remove/move chrome around it.
 */
export function RepeatableList<T>({
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = "+ Add item",
  emptyLabel = "No items yet.",
}: {
  items: T[];
  onChange: (next: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}) {
  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, createItem()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-foreground-subtle">
          {emptyLabel}
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-border bg-background-raised p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="focus-ring rounded-sm px-1.5 py-0.5 text-xs text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
                className="focus-ring rounded-sm px-1.5 py-0.5 text-xs text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="Remove"
                className="focus-ring rounded-sm px-1.5 py-0.5 text-xs text-foreground-subtle hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="focus-ring self-start rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground"
      >
        {addLabel}
      </button>
    </div>
  );
}
