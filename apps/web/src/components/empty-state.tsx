"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon?: React.ReactNode;
}

/**
 * Reusable Empty State Component
 *
 * Provides actionable empty states with optional CTA.
 *
 * Usage:
 * <EmptyState
 *   title="No vehicles yet"
 *   description="Create your first vehicle to get started"
 *   action={{ label: "Create vehicle", href: "/vehicles" }}
 * />
 */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon ? (
          <div className="mb-4 text-muted-foreground">
            {icon}
          </div>
        ) : null}

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {description ? (
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {description}
          </p>
        ) : null}

        {action ? (
          <div className="flex gap-2">
            {action.href ? (
              <Button asChild>
                <a href={action.href}>
                  <Plus className="mr-2 h-4 w-4" />
                  {action.label}
                </a>
              </Button>
            ) : action.onClick ? (
              <Button onClick={action.onClick}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
