import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-button font-semibold tracking-wide shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] active:shadow-[0_2px_5px_rgba(0,0,0,0.15)] transform hover:-translate-y-0.5 active:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-0",
        destructive:
          "bg-destructive text-destructive-foreground border-0",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground border border-input",
        secondary:
          "bg-secondary text-secondary-foreground border-0",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-none hover:shadow-none border-0",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:shadow-none border-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-3xl px-3 text-xs",
        lg: "h-10 rounded-3xl px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

