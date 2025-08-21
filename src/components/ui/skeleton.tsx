import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[rgba(40,40,40,0.4)] animate-pulse rounded-lg",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.1)] before:to-transparent",
        "before:animate-[shimmer_1.5s_infinite] before:duration-[1500ms] before:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
