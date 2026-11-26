import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-[-0.01em] ring-offset-background transition-[background-color,transform,opacity,box-shadow] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_16px_-8px_rgb(var(--acc-500)/0.55)] hover:bg-emerald-600",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:brightness-105",
        outline:
          "bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-stone-800 dark:text-white hover:bg-[rgba(118,118,128,0.18)]",
        secondary:
          "bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-stone-800 dark:text-white hover:bg-[rgba(118,118,128,0.18)]",
        ghost: "hover:bg-[rgba(118,118,128,0.12)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
