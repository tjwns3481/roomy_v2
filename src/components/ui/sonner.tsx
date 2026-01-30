// @TASK DR-P5 - Coral 테마 Toast 컴포넌트
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-airbnb-md group-[.toaster]:rounded-airbnb",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-coral group-[.toast]:text-white group-[.toast]:hover:bg-coral-dark group-[.toast]:rounded-lg group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:rounded-lg",
          success: "group-[.toast]:border-success group-[.toast]:text-success",
          error: "group-[.toast]:border-error group-[.toast]:text-error",
          warning: "group-[.toast]:border-warning group-[.toast]:text-warning",
          info: "group-[.toast]:border-coral group-[.toast]:text-coral",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
