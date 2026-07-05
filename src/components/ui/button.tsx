import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-105 [box-shadow:0_10px_30px_-8px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.4)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:brightness-105",
        outline:
          "border border-white/60 dark:border-white/15 bg-white/45 dark:bg-white/10 backdrop-blur-md hover:bg-white/65 dark:hover:bg-white/15 text-stone-700 hover:text-stone-900 shadow-sm [box-shadow:inset_0_1px_0_rgba(255,255,255,0.6)]",
        secondary:
          "bg-white/55 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 text-stone-700 dark:text-stone-100 hover:bg-white/70 dark:hover:bg-white/15",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
