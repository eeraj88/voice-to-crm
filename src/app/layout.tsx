import type { Metadata } from "next"
import "./globals.css"
import "./voyc-design.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

export const metadata: Metadata = {
  title: "VOYC — Mit deiner Stimme zum Bericht",
  description: "KI-gestützter Voice-to-CRM für Außendienst-Teams. Sprachnotizen werden automatisch in strukturierte Berichte umgewandelt.",
  keywords: ["voice CRM", "sales automation", "AI transcription", "field sales"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" data-theme="dark" suppressHydrationWarning>
      <body>
        <div className="voyc-ambient"><div className="grain" /></div>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
