"use client";

import { useEffect, useRef } from "react";

export interface ErrorSummaryItem {
  id: string;
  message: string;
}

export interface ErrorSummaryProps {
  title?: string;
  errors: ErrorSummaryItem[];
  focusId?: string;
}

/**
 * Error Summary Component - GOV.UK pattern
 *
 * Displays a list of errors at the top of a form.
 * Automatically focuses the component or a specified element when rendered.
 *
 * Usage:
 * - Place at the top of forms
 * - Pass array of { id, message } objects
 * - Optional focusId to specify which element gets focus
 */
export function ErrorSummary({ title = "There is a problem", errors, focusId }: ErrorSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus on mount or when errors change
    if (errors.length > 0) {
      const focusTarget = focusId
        ? document.getElementById(focusId)
        : containerRef.current;

      focusTarget?.focus();
    }
  }, [errors.length, focusId]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="rounded-md border border-destructive/30 bg-destructive/10 p-4 mb-6"
      tabIndex={-1}
      role="alert"
      aria-live="polite"
    >
      <h2 className="text-base font-semibold text-destructive mb-3">
        {title}
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error) => (
          <li key={error.id} className="text-sm text-destructive/90">
            <a
              href={`#${error.id}`}
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(error.id);
                target?.focus();
                target?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
