"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Base styles with Linear typography
        "text-sm leading-none font-medium select-none",
        
        // Linear colors
        "text-[#F7F8F8]",
        
        // States
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        
        // Transitions
        "transition-colors duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        
        className
      )}
      {...props}
    />
  )
}

export { Label }
