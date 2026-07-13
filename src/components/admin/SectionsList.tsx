"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sectionLabels } from "@/lib/section-registry";
import {
  reorderSections,
  toggleSectionVisibility,
  deleteSection,
} from "@/lib/admin/section-actions";
import { cn } from "@/lib/utils";
import type { SectionRow } from "@/types/content";

function SectionRowItem({
  section,
  onToggleVisibility,
  onDelete,
}: {
  section: SectionRow;
  onToggleVisibility: (id: string, next: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-background-raised px-4 py-3",
        isDragging && "opacity-50",
        !section.is_visible && "opacity-60"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="focus-ring cursor-grab touch-none rounded-sm px-1 text-foreground-subtle hover:text-foreground active:cursor-grabbing"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{sectionLabels[section.type]}</p>
        {!section.is_visible && <p className="text-xs text-foreground-subtle">Hidden</p>}
      </div>

      <button
        type="button"
        onClick={() => onToggleVisibility(section.id, !section.is_visible)}
        className="focus-ring rounded-sm px-2 py-1 text-xs text-foreground-muted hover:text-foreground"
      >
        {section.is_visible ? "Hide" : "Show"}
      </button>

      <Link
        href={`/admin/sections/${section.id}`}
        className="focus-ring rounded-sm px-2 py-1 text-xs text-accent hover:text-accent-hover"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={() => onDelete(section.id)}
        className="focus-ring rounded-sm px-2 py-1 text-xs text-foreground-subtle hover:text-red-400"
      >
        Delete
      </button>
    </div>
  );
}

export function SectionsList({ sections: initialSections }: { sections: SectionRow[] }) {
  const [sections, setSections] = useState(initialSections);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const previous = sections;
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);
    setReorderError(null);

    startTransition(async () => {
      const result = await reorderSections(reordered.map((s) => s.id));
      if (result.error) {
        // Persist failed — undo the optimistic reorder so the list doesn't lie.
        setSections(previous);
        setReorderError("Couldn't save the new order. Please try again.");
      }
    });
  }

  function handleToggleVisibility(id: string, next: boolean) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, is_visible: next } : s)));
    startTransition(() => {
      toggleSectionVisibility(id, next);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => {
      deleteSection(id);
    });
  }

  if (sections.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-foreground-muted">
        No sections yet. Add one to get started.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {reorderError && <p className="mb-3 text-xs text-red-400">{reorderError}</p>}
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <SectionRowItem
              key={section.id}
              section={section}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
