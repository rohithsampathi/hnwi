"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
          )}
          {item.onClick ? (
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-1 font-normal hover:bg-accent/50 ${
                item.isActive 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </Button>
          ) : (
            <span
              className={`px-1 ${
                item.isActive ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}