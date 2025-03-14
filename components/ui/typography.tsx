import type React from "react"
import { cn } from "@/lib/utils"

export function Heading1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("scroll-m-20 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("scroll-m-20 text-3xl md:text-4xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Heading4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("scroll-m-20 text-xl md:text-2xl font-bold tracking-tight font-heading", className)} {...props} />
}

export function Paragraph({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-base md:text-lg leading-7 font-body font-regular [&:not(:first-child)]:mt-6", className)} {...props} />
}

export function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-lg md:text-xl text-muted-foreground font-body font-regular", className)} {...props} />
}

export function Large({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-lg md:text-xl font-semibold font-body", className)} {...props} />
}

export function Small({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <small className={cn("text-sm font-regular leading-relaxed font-body", className)} {...props} />
}

export function Subtle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground font-body font-regular", className)} {...props} />
}

export function Display({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-5xl md:text-6xl font-bold tracking-tighter font-heading", className)} {...props} />
}

export function Caption({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs font-regular text-muted-foreground font-body", className)} {...props} />
}

