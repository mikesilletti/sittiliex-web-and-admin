"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-border border-t border-b border-border">
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="group focus-ring flex w-full items-center justify-between gap-4 py-6 text-left transition-colors duration-300 hover:bg-accent/5 px-3 -mx-3 rounded-sm"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="flex items-baseline gap-4">
                <span
                  className={cn(
                    "font-heading text-sm tabular-nums transition-colors duration-300",
                    isOpen ? "text-accent" : "text-foreground-subtle"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-body-lg font-heading font-medium transition-colors duration-300",
                    isOpen ? "text-accent" : "text-foreground group-hover:text-accent"
                  )}
                >
                  {item.question}
                </span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "shrink-0 transition-colors duration-300",
                  isOpen ? "text-accent" : "text-foreground-muted group-hover:text-accent"
                )}
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-3 -mx-3 pb-6 pl-[3.25rem] text-body-md text-foreground-muted max-w-2xl">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
