import type { ReactNode } from "react";

/** A titled group of fields, so long forms read as the parts of the page they edit. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background-raised/40 p-5 sm:p-6">
      <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-xs text-foreground-subtle">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
