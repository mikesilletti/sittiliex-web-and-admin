"use client";

import { RepeatableList } from "@/components/admin/RepeatableList";
import { Input } from "@/components/ui/Input";
import type { LabeledFact } from "@/types/content";

/** Editor for the small "label / value" fact strips (e.g. Built & scaled: Clensy). */
export function FactsEditor({ facts, onChange }: { facts: LabeledFact[]; onChange: (next: LabeledFact[]) => void }) {
  function set(index: number, patch: Partial<LabeledFact>) {
    const next = [...facts];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <RepeatableList
      items={facts}
      onChange={onChange}
      createItem={() => ({ id: crypto.randomUUID(), label: "", value: "" })}
      addLabel="+ Add fact"
      emptyLabel="No facts. The strip is hidden."
      renderItem={(fact, index) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            placeholder="Small label, e.g. Built & scaled"
            value={fact.label}
            onChange={(e) => set(index, { label: e.target.value })}
          />
          <Input
            placeholder="Value, e.g. Clensy"
            value={fact.value}
            onChange={(e) => set(index, { value: e.target.value })}
          />
        </div>
      )}
    />
  );
}
