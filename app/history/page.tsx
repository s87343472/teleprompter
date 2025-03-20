"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "../i18n/context"
import { Input } from "@/components/ui/input"
import { Search, Clock, ArrowUpDown, Trash, ExternalLink, Edit, Save } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogTrigger, Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface HistoryItem {
  id: number
  title: string
  preview: string
  date: string
  content: string
  tags?: string[]
}

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null)
  const [editedContent, setEditedContent] = useState("")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 24小时内显示小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours <= 0 
        ? t('history.justNow') 
        : `${hours} ${t('history.hoursAgo')}`;
    }
    
    // 7天内显示天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${t('history.daysAgo')}`;
    }
    
    // 其他情况显示日期
    return date.toLocaleDateString();
  }

  useEffect(() => {
    loadHistory();
  }, [])

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem("teleprompterHistory")
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory)
        filterAndSortHistory(parsedHistory, searchTerm, sortBy, sortDir)
      }
    } catch (error) {
      console.error("Error loading history:", error)
      toast({
        title: t('history.errorLoading'),
        description: t('history.errorLoadingDescription'),
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    filterAndSortHistory(history, searchTerm, sortBy, sortDir)
  }, [searchTerm, sortBy, sortDir])

  const filterAndSortHistory = (
    items: HistoryItem[], 
    search: string, 
    sort: "date" | "title", 
    direction: "asc" | "desc"
  ) => {
    // Filter by search term
    let filtered = items;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "date") {
        return direction === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
    
    setFilteredHistory(sorted);
  }

  const toggleSort = () => {
    if (sortBy === "date") {
      setSortBy("title");
      setSortDir("asc");
    } else {
      setSortBy("date");
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    }
  }

  const loadScript = (item: HistoryItem) => {
    localStorage.setItem("teleprompterScript", item.content)
    router.push("/prompter")
  }

  const deleteScript = (id: number) => {
    if (confirm(t('history.confirmDelete'))) {
      const newHistory = history.filter((item) => item.id !== id)
      setHistory(newHistory)
      filterAndSortHistory(newHistory, searchTerm, sortBy, sortDir)
      localStorage.setItem("teleprompterHistory", JSON.stringify(newHistory))
      toast({
        title: t('history.deleted'),
        description: t('history.deletedDescription'),
      })
    }
  }

  const clearHistory = () => {
    if (confirm(t('history.confirmClear'))) {
      setHistory([])
      setFilteredHistory([])
      localStorage.removeItem("teleprompterHistory")
      toast({
        title: t('history.cleared'),
        description: t('history.clearedDescription'),
      })
    }
  }

  const startEditing = (item: HistoryItem) => {
    setEditingItem(item)
    setEditedContent(item.content)
  }

  const saveEdits = () => {
    if (!editingItem) return

    const updatedItem = {
      ...editingItem,
      content: editedContent,
      title: editedContent.split('\n')[0].substring(0, 50) || t('history.untitledScript'),
      preview: editedContent.substring(0, 100),
      date: new Date().toISOString()
    }

    const newHistory = history.map(item => 
      item.id === editingItem.id ? updatedItem : item
    )

    setHistory(newHistory)
    filterAndSortHistory(newHistory, searchTerm, sortBy, sortDir)
    localStorage.setItem("teleprompterHistory", JSON.stringify(newHistory))
    
    setEditingItem(null)
    setEditedContent("")

    toast({
      title: t('history.updated'),
      description: t('history.updatedDescription'),
    })
  }

  const getContentPreview = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return "";
    
    // 跳过标题，返回第一个非空内容行的前100个字符
    const firstContentLine = lines.length > 1 ? lines[1] : lines[0];
    return firstContentLine.substring(0, 100) + (firstContentLine.length > 100 ? '...' : '');
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="sr-only">{t('history.title')}</h1>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('history.title')}</h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="flex gap-1">
              <Trash className="h-4 w-4" />
              <span className="hidden sm:inline">{t('history.clearAll')}</span>
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="flex gap-1"
            onClick={() => router.push('/prompter')}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">{t('history.backToPrompter')}</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>{t('history.subtitle')}</CardDescription>
        </CardHeader>
        
        {history.length > 0 && (
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('history.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleSort}
                title={sortBy === "date" 
                  ? t('history.sortByDate') + (sortDir === "asc" ? " ↑" : " ↓")
                  : t('history.sortByTitle') + (sortDir === "asc" ? " ↑" : " ↓")}
              >
                {sortBy === "date" ? <Clock className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
              </Button>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? t('history.noResults') : t('history.noHistory')}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4 pb-0">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(item.date)}</span>
                            <Badge variant="outline" className="ml-2">
                              {Math.ceil(item.content.length / 1000)}K {t('history.characters')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 w-8" title={t('history.edit')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{t('history.editScript')}</DialogTitle>
                                <DialogDescription>{t('history.editScriptDescription')}</DialogDescription>
                              </DialogHeader>
                              
                              <Textarea 
                                value={editedContent} 
                                onChange={(e) => setEditedContent(e.target.value)} 
                                className="min-h-[300px] font-mono"
                              />
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingItem(null)}>
                                  {t('common.cancel')}
                                </Button>
                                <Button onClick={saveEdits}>
                                  <Save className="h-4 w-4 mr-2" />
                                  {t('common.save')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button size="sm" className="h-8" onClick={() => loadScript(item)}>
                            {t('history.load')}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 text-red-600"
                            onClick={() => deleteScript(item.id)}
                            title={t('history.delete')}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {getContentPreview(item.content)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
        
        {history.length === 0 && (
          <CardContent>
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">{t('history.emptyHistory')}</p>
              <Button onClick={() => router.push('/prompter')}>
                {t('history.createScript')}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

