"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, MessageCircle } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

/** How long to wait for the HighLevel widget before offering a fallback. */
const WIDGET_TIMEOUT_MS = 8000;

/**
 * Points visitors at the HighLevel chat launcher, which mounts as a floating
 * bubble in the bottom-right corner rather than inline. If the third-party
 * script is blocked or slow, the panel falls back to email/phone so the page
 * is never a dead end for someone trying to reach us.
 */
export function ChatWidgetPrompt({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [widgetMissing, setWidgetMissing] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (document.querySelector("chat-widget")) {
        window.clearInterval(timer);
        return;
      }
      if (Date.now() - started > WIDGET_TIMEOUT_MS) {
        window.clearInterval(timer);
        setWidgetMissing(true);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-background-raised/60 p-6 md:p-8",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-16 h-52 w-52 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-background text-accent">
            {!shouldReduceMotion && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-accent/40"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <MessageCircle size={18} />
          </span>

          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {widgetMissing ? "Chat is not loading" : "The chat lives in the corner"}
            </h3>
            <p className="mt-1.5 max-w-md text-body-sm text-foreground-muted">
              {widgetMissing ? (
                <>
                  Your browser or network may be blocking it. Email{" "}
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                  >
                    {COMPANY.email}
                  </a>{" "}
                  or call{" "}
                  <a
                    href={COMPANY.phoneHref}
                    className="focus-ring rounded-sm text-accent hover:text-accent-hover"
                  >
                    {COMPANY.phone}
                  </a>{" "}
                  and we will pick it up from there.
                </>
              ) : (
                <>
                  Look for the chat bubble in the bottom-right of your screen. That widget is the
                  only place on this page where you can share your mobile number and opt in to text
                  messages.
                </>
              )}
            </p>
          </div>
        </div>

        {!widgetMissing && (
          <motion.div
            aria-hidden="true"
            className="hidden shrink-0 text-accent sm:block"
            animate={shouldReduceMotion ? undefined : { x: [0, 6, 0], y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDownRight size={28} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
