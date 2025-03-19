"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/app/i18n/context"
import { LanguageSwitcher } from "./language-switcher"

export default function Header() {
  const pathname = usePathname()
  const { t } = useI18n()

  const navigation = [
    { name: t('common.home'), href: '/' },
    { name: t('common.prompter'), href: '/prompter' },
    { name: t('common.history'), href: '/history' },
    { name: t('common.settings'), href: '/settings' },
  ]

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <nav className="flex items-center space-x-2">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={pathname === item.href ? "bg-primary/10" : ""}
                asChild
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
} 