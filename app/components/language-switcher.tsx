"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/app/i18n/context"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLocale('en')}
        className={locale === 'en' ? 'bg-primary/10 font-medium' : 'font-normal'}
      >
        EN
      </Button>
      <Button
        variant={locale === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLocale('zh')}
        className={locale === 'zh' ? 'bg-primary/10 font-medium' : 'font-normal'}
      >
        中文
      </Button>
    </div>
  )
} 