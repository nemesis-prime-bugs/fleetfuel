"use client";

import { useEffect, useRef } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type FieldErrorItem = {
  fieldId: string;
  message: string;
};

export function ErrorSummary({ title = "Please fix the following", errors }: { title?: string; errors: FieldErrorItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (errors.length > 0) {
      // Focus summary for accessibility (WCAG-friendly pattern)
      ref.current?.focus();
    }
  }, [errors.length]);

  if (errors.length === 0) return null;

  return (
    <Alert ref={ref as any} tabIndex={-1} className="border-destructive/30 bg-destructive/10">
      <AlertTitle className="text-destructive">{title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          {errors.map((e) => (
            <li key={e.fieldId}>
              <a
                href={`#${e.fieldId}`}
                className="underline underline-offset-2"
                onClick={(ev) => {
                  ev.preventDefault();
                  const el = document.getElementById(e.fieldId) as HTMLElement | null;
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  // if input is nested, try focus first form control
                  const focusable = el?.querySelector("input,select,textarea,button") as HTMLElement | null;
                  (focusable ?? el)?.focus?.();
                }}
              >
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
