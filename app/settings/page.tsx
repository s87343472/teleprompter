"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "../i18n/context"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 默认设置
const defaultSettings = {
  theme: "light",
  fontSize: 32,
  scrollSpeed: 2,
  lineHeight: 1.5,
  textAlign: "left",
  autoSave: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const { toast } = useToast()
  const { t, locale, setLocale } = useI18n()

  // 从localStorage加载设置
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("teleprompterSettings")
      if (savedSettings) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings)
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }, [])

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = () => {
    localStorage.setItem("teleprompterSettings", JSON.stringify(settings))
    toast({
      title: t('settings.saved'),
      description: t('settings.savedDescription'),
    })
  }

  const resetSettings = () => {
    if (confirm(t('settings.confirmReset'))) {
      setSettings(defaultSettings)
      localStorage.setItem("teleprompterSettings", JSON.stringify(defaultSettings))
      toast({
        title: t('settings.reset'),
        description: t('settings.resetDescription'),
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
          <TabsTrigger value="prompt">{t('settings.tabs.prompt')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('settings.tabs.advanced')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.tabs.general')}</CardTitle>
              <CardDescription>{t('settings.generalDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('settings.theme.title')}</Label>
                <RadioGroup 
                  value={settings.theme} 
                  onValueChange={(value) => updateSetting('theme', value)}
                >
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
                <Label>{t('settings.language.title')}</Label>
                <RadioGroup 
                  value={locale} 
                  onValueChange={(value: 'en' | 'zh') => setLocale(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">{t('settings.language.en')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zh" id="zh" />
                    <Label htmlFor="zh">{t('settings.language.zh')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="autoSave">{t('settings.autoSave')}</Label>
                  <Switch 
                    id="autoSave" 
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{t('settings.autoSaveDescription')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.tabs.prompt')}</CardTitle>
              <CardDescription>{t('settings.promptDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t('settings.fontSize.title')}</Label>
                  <span className="text-sm font-medium">{settings.fontSize}px</span>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  min={16}
                  max={72}
                  step={4}
                  onValueChange={(value) => updateSetting('fontSize', value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t('settings.scrollSpeed.title')}</Label>
                  <span className="text-sm font-medium">{settings.scrollSpeed.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.scrollSpeed]}
                  min={0.5}
                  max={10}
                  step={0.5}
                  onValueChange={(value) => updateSetting('scrollSpeed', value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t('settings.lineHeight.title')}</Label>
                  <span className="text-sm font-medium">{settings.lineHeight.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.lineHeight]}
                  min={1.0}
                  max={2.0}
                  step={0.1}
                  onValueChange={(value) => updateSetting('lineHeight', value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <Label>{t('settings.textAlign.title')}</Label>
                <RadioGroup 
                  value={settings.textAlign} 
                  onValueChange={(value) => updateSetting('textAlign', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left">{t('settings.textAlign.left')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="center" />
                    <Label htmlFor="center">{t('settings.textAlign.center')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right">{t('settings.textAlign.right')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.tabs.advanced')}</CardTitle>
              <CardDescription>{t('settings.advancedDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 border-amber-300">
                <Info className="h-4 w-4 text-amber-800" />
                <AlertDescription className="text-amber-800">
                  {t('settings.dataWarning')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={resetSettings}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {t('settings.reset')}
                </Button>
                <p className="text-sm text-muted-foreground">{t('settings.resetDescription')}</p>
              </div>

              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (confirm(t('settings.confirmClearData'))) {
                      localStorage.clear();
                      toast({
                        title: t('settings.dataClearedTitle'),
                        description: t('settings.dataClearedDescription'),
                      });
                    }
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {t('settings.clearData')}
                </Button>
                <p className="text-sm text-muted-foreground">{t('settings.clearDataDescription')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button onClick={saveSettings} size="lg" className="gap-2">
          {t('settings.save')}
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/prompter'}>
          {t('settings.backToPrompter')}
        </Button>
      </div>
    </div>
  )
}

