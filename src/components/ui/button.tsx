import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-normal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#141516] text-[#F7F8F8] rounded-[30px] hover:bg-[#1a1b1c] active:bg-[#0f1011] border-none",
        secondary:
          "bg-transparent text-[#8A8F98] rounded-lg hover:bg-[#f7f8f8] hover:text-[#626269] active:bg-[#e6e6e6] border-none font-medium",
        outline:
          "bg-[#28282C] text-[#F7F8F8] rounded-full border border-[#3E3E44] hover:bg-[#3e3e44] hover:border-[#626269] active:bg-[#1e1f16] font-medium",
        destructive:
          "bg-[#C52828] text-white rounded-[30px] hover:bg-[#b02323] active:bg-[#9e1f1f] border-none",
        ghost:
          "bg-transparent text-[#626269] rounded-lg hover:bg-[#f7f8f8] hover:text-[#282828] active:bg-[#e6e6e6] border-none",
        link: 
          "text-[#5E6AD2] underline-offset-4 hover:underline hover:text-[#4C59BD] bg-transparent border-none rounded-none p-0",
      },
      size: {
        default: "px-6 py-4 text-base min-h-[48px]",
        sm: "px-3 py-0 text-sm min-h-[32px]",
        lg: "px-8 py-5 text-lg min-h-[56px]",
        icon: "w-12 h-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
