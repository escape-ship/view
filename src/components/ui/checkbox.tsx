"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles
        "peer size-4 shrink-0 rounded border outline-none",
        
        // Default colors
        "border-[#3E3E44] bg-[rgba(40,40,40,0.2)]",
        
        // Checked state with Linear primary color
        "data-[state=checked]:bg-[#5E6AD2] data-[state=checked]:border-[#5E6AD2] data-[state=checked]:text-white",
        
        // Focus states
        "focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/20 focus-visible:border-[#5E6AD2]",
        
        // Error states
        "aria-invalid:border-[#C52828] aria-invalid:ring-2 aria-invalid:ring-[#C52828]/20",
        
        // Hover states
        "hover:border-[#626269] data-[state=checked]:hover:bg-[#4C59BD]",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // Transitions with Linear timing
        "transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
