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
          toast: "cn-toast !py-4 !px-5 !text-sm !font-medium !shadow-md !border-l-2 !rounded-xl",
          success:
            "!bg-zinc-50 !text-zinc-900 !border-zinc-200 !border-l-zinc-900 dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700 dark:!border-l-zinc-300",
          error:
            "!bg-zinc-100 !text-zinc-900 !border-zinc-300 !border-l-zinc-700 dark:!bg-zinc-900 dark:!text-zinc-100 dark:!border-zinc-700 dark:!border-l-zinc-400",
          warning:
            "!bg-zinc-50 !text-zinc-800 !border-zinc-300 !border-l-zinc-500 dark:!bg-zinc-900 dark:!text-zinc-200 dark:!border-zinc-700 dark:!border-l-zinc-500",
          info:
            "!bg-white !text-zinc-900 !border-zinc-200 !border-l-zinc-400 dark:!bg-zinc-950 dark:!text-zinc-100 dark:!border-zinc-800 dark:!border-l-zinc-500",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-zinc-500 dark:!text-zinc-400",
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
