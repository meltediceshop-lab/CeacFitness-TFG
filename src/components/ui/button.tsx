import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] ring-offset-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-white hover:bg-emerald-600",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline:
          "bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-stone-800 dark:text-white hover:bg-[rgba(118,118,128,0.18)]",
        secondary:
          "bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-stone-800 dark:text-white hover:bg-[rgba(118,118,128,0.18)]",
        ghost: "hover:bg-[rgba(118,118,128,0.12)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5",
        lg: "h-12 px-8 text-base",
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
