"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { useI18n } from "@/app/i18n/context"

export function Comments() {
  const { t } = useI18n()
  
  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <h1 className="text-2xl font-bold mb-6">{t('comments.title')}</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">{t('comments.viewComments')}</TabsTrigger>
          <TabsTrigger value="add">{t('comments.addComment')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <CommentList />
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-md">
              <h3 className="font-semibold">{t('comments.welcome')}</h3>
              <p className="text-sm mt-1">{t('comments.welcomeDescription')}</p>
            </div>
            <CommentForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 