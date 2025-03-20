"use client"

import { Comments } from "@/app/components/comments/comments"
import { Metadata } from "next"
import { useI18n } from "@/app/i18n/context"
import { cn } from "@/lib/utils"

export default function CommentsPage() {
  const { t } = useI18n()
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="sr-only">留言板</h1>
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('comments.title') || '留言板'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('comments.description') || '欢迎分享您的想法和反馈'}
          </p>
        </div>
        
        <div className={cn(
          "bg-card text-card-foreground",
          "rounded-lg border shadow-sm"
        )}>
          <Comments />
        </div>
      </div>
    </div>
  )
} 