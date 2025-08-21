import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
  {
    variants: {
      variant: {
        default: 
          "bg-[rgba(40,40,40,0.2)] text-[#F7F8F8] border border-[rgba(255,255,255,0.1)]",
        success:
          "bg-[rgba(104,204,88,0.1)] text-[#68CC58] border border-[rgba(104,204,88,0.2)] [&>svg]:text-[#68CC58] *:data-[slot=alert-description]:text-[#68CC58]/90",
        warning:
          "bg-[rgba(242,153,74,0.1)] text-[#F2994A] border border-[rgba(242,153,74,0.2)] [&>svg]:text-[#F2994A] *:data-[slot=alert-description]:text-[#F2994A]/90",
        error:
          "bg-[rgba(197,40,40,0.1)] text-[#C52828] border border-[rgba(197,40,40,0.2)] [&>svg]:text-[#C52828] *:data-[slot=alert-description]:text-[#C52828]/90",
        info:
          "bg-[rgba(2,184,204,0.1)] text-[#02B8CC] border border-[rgba(2,184,204,0.2)] [&>svg]:text-[#02B8CC] *:data-[slot=alert-description]:text-[#02B8CC]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
