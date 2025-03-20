"use client"

import { useEffect, useRef, useState } from 'react'

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

export function Turnstile({ siteKey, onVerify, theme = 'light', size = 'normal' }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // 加载Turnstile脚本
    if (!loaded) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = () => setLoaded(true)
      document.head.appendChild(script)
      
      return () => {
        document.head.removeChild(script)
      }
    }
    
    // 渲染Turnstile
    if (loaded && container.current && !widgetId && window.turnstile) {
      const id = window.turnstile.render(container.current, {
        sitekey: siteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          onVerify(token)
        },
      })
      setWidgetId(id)
    }
    
    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId)
      }
    }
  }, [siteKey, onVerify, theme, size, loaded, widgetId])

  return <div ref={container} className="w-full flex justify-center my-2" />
}

// 为了TypeScript支持
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
          callback: (token: string) => void
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
} 