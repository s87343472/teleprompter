"use client"

import { useI18n } from "@/app/i18n/context"

export function Footer() {
  const { t } = useI18n()
  
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col md:h-16 items-center justify-between gap-4 md:flex-row">
        <div className="text-center md:text-left">
          <p className="text-sm leading-loose text-muted-foreground">
            © {new Date().getFullYear()} Teleprompter Today. {t('footer.rights')}
          </p>
        </div>
        {/* 暂时注释掉链接
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('footer.privacy')}
          </a>
          <a
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('footer.terms')}
          </a>
        </div>
        */}
      </div>
    </footer>
  )
} 