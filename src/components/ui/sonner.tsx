"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      duration={4000}
      visibleToasts={5}
      icons={{
        success: (
          <CircleCheckIcon className="size-5" />
        ),
        info: (
          <InfoIcon className="size-5" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5" />
        ),
        error: (
          <OctagonXIcon className="size-5" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast !py-4 !px-5 !text-sm !font-medium !shadow-lg !border-l-4",
          success:
            "!bg-emerald-50 !text-emerald-900 !border-l-emerald-500 !border-emerald-200 dark:!bg-emerald-950 dark:!text-emerald-100 dark:!border-emerald-700 dark:!border-l-emerald-400",
          error:
            "!bg-red-50 !text-red-900 !border-l-red-500 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-700 dark:!border-l-red-400",
          warning:
            "!bg-amber-50 !text-amber-900 !border-l-amber-500 !border-amber-200 dark:!bg-amber-950 dark:!text-amber-100 dark:!border-amber-700 dark:!border-l-amber-400",
          info:
            "!bg-blue-50 !text-blue-900 !border-l-blue-500 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-100 dark:!border-blue-700 dark:!border-l-blue-400",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-gray-500 dark:!text-gray-400",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "380px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
