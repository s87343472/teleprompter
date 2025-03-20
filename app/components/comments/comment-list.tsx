"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/app/i18n/context"

interface Comment {
  id: string
  name: string
  email: string
  comment: string
  createdAt: string
}

export function CommentList() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, locale } = useI18n()

  useEffect(() => {
    // 获取评论数据
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/comments")
        
        if (!response.ok) {
          throw new Error(t("comments.loading"))
        }
        
        const data = await response.json()
        setComments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : t("comments.submitFailed"))
        console.error("获取评论失败:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [t])

  // 获取用户名首字母作为头像
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('comments.loading')}</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[90%] mb-2" />
              <Skeleton className="h-4 w-[70%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <h2 className="text-xl font-bold">{t('comments.submitFailed')}</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed rounded-md">
        <h2 className="text-xl font-medium text-gray-500">{t('comments.noComments')}</h2>
        <p className="text-gray-400 mt-2">{t('comments.beTheFirst')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('comments.title')} ({comments.length})</h2>
      {comments.map((comment) => (
        <Card key={comment.id} className="w-full">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar>
              <AvatarFallback>{getInitials(comment.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{comment.name}</CardTitle>
              <CardDescription>{formatDate(comment.createdAt)}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{comment.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 