"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "../i18n/context"

interface HistoryItem {
  id: number
  title: string
  preview: string
  date: string
  content: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  useEffect(() => {
    const savedHistory = localStorage.getItem("teleprompterHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const loadScript = (item: HistoryItem) => {
    localStorage.setItem("teleprompterScript", item.content)
    router.push("/prompter")
  }

  const deleteScript = (id: number) => {
    if (confirm(t('history.confirmDelete'))) {
      const newHistory = history.filter((item) => item.id !== id)
      setHistory(newHistory)
      localStorage.setItem("teleprompterHistory", JSON.stringify(newHistory))
      toast({
        title: t('history.delete'),
        description: t('history.delete'),
      })
    }
  }

  const clearHistory = () => {
    if (confirm(t('history.confirmClear'))) {
      setHistory([])
      localStorage.removeItem("teleprompterHistory")
      toast({
        title: t('history.clearAll'),
        description: t('history.clearAll'),
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('history.title')}</CardTitle>
          {history.length > 0 && (
            <Button variant="outline" onClick={clearHistory}>
              {t('history.clearAll')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('history.noHistory')}</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => loadScript(item)}>
                          {t('history.load')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScript(item.id)}
                        >
                          {t('history.delete')}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.preview}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

