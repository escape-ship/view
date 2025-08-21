import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex min-h-16 w-full rounded-lg border px-3 py-2 text-sm resize-vertical",
        
        // Colors and theming
        "text-[#F7F8F8] placeholder:text-[#8A8F98] border-[#3E3E44] bg-[rgba(40,40,40,0.2)]",
        
        // Focus states with Linear colors
        "focus-visible:outline-none focus-visible:border-[#5E6AD2] focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/20",
        
        // Error states
        "aria-invalid:border-[#C52828] aria-invalid:ring-2 aria-invalid:ring-[#C52828]/20",
        
        // Transitions with Linear timing
        "transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // Hover state
        "hover:border-[#626269]",
        
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
