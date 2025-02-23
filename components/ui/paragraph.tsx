"use client"

import { cn } from "@/lib/utils"
import type * as React from "react"

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function Paragraph({ className, ...props }: ParagraphProps) {
  return <p className={cn("leading-7 font-body font-regular [&:not(:first-child)]:mt-6", className)} {...props} />
}

