"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/app/i18n/context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// 评论验证模式
const formSchema = z.object({
  name: z.string().min(2, {
    message: "用户名至少需要2个字符",
  }),
  email: z.string().email({
    message: "请输入有效的电子邮件地址",
  }),
  comment: z.string().min(5, {
    message: "评论至少需要5个字符",
  }),
})

export function CommentForm() {
  const { toast } = useToast()
  const { t } = useI18n()

  // 创建表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      comment: "",
    },
  })

  // 提交表单 - 显示功能禁用消息
  function onSubmit() {
    toast({
      title: "评论功能暂时禁用",
      description: "我们计划在未来用户量增加时迁移到专门的服务器。请谅解！",
      variant: "destructive",
    })
  }

  return (
    <Form {...form}>
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>评论功能暂时禁用</AlertTitle>
        <AlertDescription>
          我们计划在未来用户量增加时迁移到专门的服务器处理评论功能。请您谅解！
        </AlertDescription>
      </Alert>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('comments.userName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('comments.userName')} {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('comments.email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('comments.email')} type="email" {...field} disabled />
                </FormControl>
                <FormDescription>
                  {t('comments.emailPrivacy')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('comments.comment')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('comments.commentPlaceholder')}
                  className="min-h-[120px]"
                  {...field}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={true}>
          {t('comments.submit')} (已禁用)
        </Button>
      </form>
    </Form>
  )
} 