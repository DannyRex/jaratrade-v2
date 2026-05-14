import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, eyebrow, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2 pb-6 sm:flex-row sm:items-end sm:justify-between", className)} {...props}>
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
