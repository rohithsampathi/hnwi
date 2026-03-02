"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InstitutionalSectionHeader } from "@/components/ui/institutional";
import { SourceFooter } from "@/components/ui/source-footer";
import { SectionReveal } from "@/components/ui/section-reveal";

interface MemoSectionShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "default" | "emerald" | "amber" | "red";
  source?: string;
  direction?: "up" | "left" | "right";
  children: ReactNode;
  className?: string;
  id?: string;
}

export function MemoSectionShell({
  title,
  subtitle,
  badge,
  badgeColor,
  source,
  direction = "up",
  children,
  className,
  id,
}: MemoSectionShellProps) {
  return (
    <SectionReveal direction={direction}>
      <section id={id} className={cn("space-y-6", className)}>
        <InstitutionalSectionHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          badgeColor={badgeColor}
        />
        {children}
        {source && <SourceFooter source={source} />}
      </section>
    </SectionReveal>
  );
}
