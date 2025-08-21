import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#141516] text-[#F7F8F8] hover:bg-[#1a1b1c]",
        secondary:
          "border-transparent bg-[rgba(40,40,40,0.2)] text-[#F7F8F8] hover:bg-[rgba(40,40,40,0.3)]",
        destructive:
          "border-transparent bg-[#C52828] text-white hover:bg-[#d63333]",
        success:
          "border-transparent bg-[#68CC58] text-white hover:bg-[#5fb84f]",
        warning:
          "border-transparent bg-[#F2994A] text-white hover:bg-[#f0a662]",
        info:
          "border-transparent bg-[#02B8CC] text-white hover:bg-[#2ac4d6]",
        outline:
          "border-[rgba(255,255,255,0.1)] text-[#8A8F98] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F7F8F8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
