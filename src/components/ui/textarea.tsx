// @TASK DR-P5 - Coral 테마 Textarea 컴포넌트
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-border bg-white px-4 py-3.5 text-base text-text-primary transition-colors placeholder:text-text-tertiary focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
