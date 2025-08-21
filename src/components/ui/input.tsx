import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-sm",
        
        // Colors and theming
        "text-[#F7F8F8] placeholder:text-[#8A8F98] border-[#3E3E44] bg-[rgba(40,40,40,0.2)]",
        
        // Focus states with Linear colors
        "focus-visible:outline-none focus-visible:border-[#5E6AD2] focus-visible:ring-2 focus-visible:ring-[#5E6AD2]/20",
        
        // Error states
        "aria-invalid:border-[#C52828] aria-invalid:ring-2 aria-invalid:ring-[#C52828]/20",
        
        // Transitions with Linear timing
        "transition-all duration-[160ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        
        // File input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#F7F8F8]",
        
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        
        // Hover state
        "hover:border-[#626269]",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }
