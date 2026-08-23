"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { checkNewSubmissions, type NewSubmissionSummary } from "@/lib/admin/contact-actions";

const LAST_SEEN_KEY = "sillettix_admin_contacts_last_seen";
const POLL_INTERVAL_MS = 20_000;
const TOAST_LIFETIME_MS = 8_000;
const MAX_VISIBLE_TOASTS = 3;

interface Toast extends NewSubmissionSummary {
  toastId: string;
}

const ContactNotificationsContext = createContext<{
  unreadCount: number;
  markContactsSeen: () => void;
} | null>(null);

export function useContactNotifications() {
  const ctx = useContext(ContactNotificationsContext);
  if (!ctx) throw new Error("useContactNotifications must be used within ContactNotificationsProvider");
  return ctx;
}

export function ContactNotificationsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // The high-water mark for polling — always advances forward. Distinct
  // from localStorage's "last seen" mark, which only advances when the
  // admin actually visits Contacts (that's what clears the badge).
  const latestKnownAtRef = useRef<string>(new Date().toISOString());
  const hasCaughtUpRef = useRef(false);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    const lastSeenAt = stored ?? new Date().toISOString();
    if (!stored) localStorage.setItem(LAST_SEEN_KEY, lastSeenAt);
    latestKnownAtRef.current = lastSeenAt;

    let cancelled = false;

    async function poll() {
      const fresh = await checkNewSubmissions(latestKnownAtRef.current);
      if (cancelled) return;

      // The first poll after mount/reload may surface arrivals from while
      // the admin was away — count them, but don't toast a burst of stale
      // arrivals as if they just happened. This must be marked regardless
      // of whether that first poll found anything, otherwise a first poll
      // that finds zero (the common case) never flips the flag, and the
      // *next* poll — which is genuinely live — gets wrongly treated as
      // the stale catch-up batch and suppressed from toasting.
      const isFirstPoll = !hasCaughtUpRef.current;
      hasCaughtUpRef.current = true;

      if (fresh.length === 0) return;
      latestKnownAtRef.current = fresh[fresh.length - 1].created_at;
      setUnreadCount((n) => n + fresh.length);

      if (isFirstPoll) return;

      const newToasts = fresh.map((s) => ({ ...s, toastId: `${s.id}-${Date.now()}-${Math.random()}` }));
      setToasts((prev) => [...prev, ...newToasts]);
      for (const t of newToasts) {
        setTimeout(() => dismissToast(t.toastId), TOAST_LIFETIME_MS);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [dismissToast]);

  const markContactsSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SEEN_KEY, now);
    setUnreadCount(0);
  }, []);

  return (
    <ContactNotificationsContext.Provider value={{ unreadCount, markContactsSeen }}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2 sm:right-6 sm:top-6">
        {toasts.slice(-MAX_VISIBLE_TOASTS).map((t) => (
          <div
            key={t.toastId}
            role="status"
            className="pointer-events-auto w-72 cursor-pointer rounded-md border border-border border-l-3 border-l-accent bg-background-raised px-4 py-3 shadow-lg transition-opacity"
            onClick={() => {
              dismissToast(t.toastId);
              router.push("/admin/contacts");
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">New inquiry</p>
                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                  {t.name}
                  {t.company ? ` · ${t.company}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToast(t.toastId);
                }}
                className="focus-ring shrink-0 rounded-sm text-foreground-subtle hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ContactNotificationsContext.Provider>
  );
}
