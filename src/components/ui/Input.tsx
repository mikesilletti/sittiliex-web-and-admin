import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "focus-ring w-full rounded-sm border border-border-strong bg-background-raised px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-200 hover:border-accent/30 focus-visible:border-accent/50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "min-h-32 resize-y", className)} {...props} />;
}
