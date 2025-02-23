import type React from "react"
import { cn } from "@/lib/utils"

export function Heading1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("scroll-m-20 text-4xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("scroll-m-20 text-3xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("scroll-m-20 text-2xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("scroll-m-20 text-xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Paragraph({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("leading-7 font-body font-regular [&:not(:first-child)]:mt-6", className)} {...props} />
}

export function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xl text-muted-foreground font-body font-regular", className)} {...props} />
}

export function Large({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-lg font-semibold font-body", className)} {...props} />
}

export function Small({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <small className={cn("text-sm font-regular leading-none font-body", className)} {...props} />
}

export function Subtle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground font-body font-regular", className)} {...props} />
}

