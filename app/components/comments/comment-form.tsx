"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Turnstile } from "./turnstile"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/app/i18n/context"

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 创建表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      comment: "",
    },
  })

  // 提交表单
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 验证Turnstile令牌存在
    if (!turnstileToken) {
      toast({
        title: t("comments.verificationFailed"),
        description: t("comments.verification"),
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          token: turnstileToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t("comments.submitFailed"))
      }

      // 重置表单
      form.reset()
      setTurnstileToken(null)
      
      // 显示成功消息
      toast({
        title: t("comments.commentSubmitted"),
        description: t("comments.thankYou"),
      })
    } catch (error) {
      toast({
        title: t("comments.submitFailed"),
        description: error instanceof Error ? error.message : t("comments.submitFailed"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('comments.userName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('comments.userName')} {...field} />
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
                  <Input placeholder={t('comments.email')} type="email" {...field} />
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cloudflare Turnstile 验证 */}
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} /* 使用环境变量中的站点密钥 */
          onVerify={(token) => setTurnstileToken(token)}
        />

        <Button type="submit" disabled={isSubmitting || !turnstileToken}>
          {isSubmitting ? t('comments.submitting') : t('comments.submit')}
        </Button>
      </form>
    </Form>
  )
} 