"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
    </SessionProvider>
  )
}
