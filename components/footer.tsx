"use client"

import { useI18n } from "@/app/i18n/context"
import { Mail } from "lucide-react"

export function Footer() {
  const { t } = useI18n()
  
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © 2024 Teleprompter Today. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:support@teleprompter.today"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>support@teleprompter.today</span>
          </a>
        </div>
      </div>
    </footer>
  )
} 