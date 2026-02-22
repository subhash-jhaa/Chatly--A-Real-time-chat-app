/**
 * Toaster — Global toast notification container.
 *
 * WHERE IT'S RENDERED:
 * Placed in the root layout (app/layout.tsx) so toasts can appear from
 * any page or component in the app — error toasts, success messages, etc.
 *
 * WHY "dark" THEME IS HARDCODED:
 * Our app uses a fixed dark color scheme (bg-[#0f1117]) — we don't support
 * light mode switching, so we hardcode the toast theme to match.
 */

"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#1a1d27",
          "--normal-text": "#ffffff",
          "--normal-border": "#374151",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

