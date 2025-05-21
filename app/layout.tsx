import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AuthProvider } from "@/contexts/auth-context"
import { TokenRefreshProvider } from "@/contexts/token-refresh-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CEAD - Sistema de Chamados",
  description: "Sistema de Chamados para o Centro de Educação a Distância da PUC Goiás",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <TokenRefreshProvider>{children}</TokenRefreshProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
