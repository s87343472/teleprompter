"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "../i18n/context"

export default function SettingsPage() {
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState("medium")
  const [scrollSpeed, setScrollSpeed] = useState("medium")
  const { toast } = useToast()
  const { t } = useI18n()

  const saveSettings = () => {
    localStorage.setItem("settings", JSON.stringify({ theme, fontSize, scrollSpeed }))
    toast({
      title: t('settings.save'),
      description: t('settings.save'),
    })
  }

  const resetSettings = () => {
    setTheme("system")
    setFontSize("medium")
    setScrollSpeed("medium")
    localStorage.removeItem("settings")
    toast({
      title: t('settings.reset'),
      description: t('settings.reset'),
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>{t('settings.theme.title')}</Label>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">{t('settings.theme.light')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">{t('settings.theme.dark')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">{t('settings.theme.system')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>{t('settings.fontSize.title')}</Label>
            <RadioGroup value={fontSize} onValueChange={setFontSize}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small">{t('settings.fontSize.small')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">{t('settings.fontSize.medium')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large">{t('settings.fontSize.large')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>{t('settings.scrollSpeed.title')}</Label>
            <RadioGroup value={scrollSpeed} onValueChange={setScrollSpeed}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slow" id="slow" />
                <Label htmlFor="slow">{t('settings.scrollSpeed.slow')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium-speed" />
                <Label htmlFor="medium-speed">{t('settings.scrollSpeed.medium')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast" id="fast" />
                <Label htmlFor="fast">{t('settings.scrollSpeed.fast')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveSettings}>{t('settings.save')}</Button>
            <Button variant="outline" onClick={resetSettings}>
              {t('settings.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

