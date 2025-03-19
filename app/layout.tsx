import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { I18nProvider } from "./i18n/context"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { defaultMetadata } from "./metadata"
import { GoogleAnalytics } from "@/components/google-analytics"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Teleprompter Today",
  description: "专业的网页提词器应用",
  applicationName: "Teleprompter Today",
  authors: [{ name: "Teleprompter Today Team" }],
  keywords: ["teleprompter", "提词器", "演讲", "直播", "主持"],
  creator: "Teleprompter Today Team",
  publisher: "Teleprompter Today",
  robots: "index, follow",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png" },
    ],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'zh': '/zh',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="alternate" href="/" hrefLang="x-default" />
        <link rel="alternate" href="/en" hrefLang="en" />
        <link rel="alternate" href="/zh" hrefLang="zh" />
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

