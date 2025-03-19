"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  Upload,
  Download,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useI18n } from "@/app/i18n/context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// 添加 gtag 类型定义
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        [key: string]: any
      }
    ) => void
  }
}

export default function PrompterPage() {
  const [script, setScript] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(2)
  const [fontSize, setFontSize] = useState<number>(32)
  const [isMirrored, setIsMirrored] = useState<boolean>(false)
  const [isVerticalMirrored, setIsVerticalMirrored] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true)
  const [currentPosition, setCurrentPosition] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [lineHeight, setLineHeight] = useState<number>(1.5)
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [progressBarRef, setProgressBarRef] = useState<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [theme, setTheme] = useState<'light'>('light')
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchStartPosition, setTouchStartPosition] = useState<number | null>(null)
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragStartPosition, setDragStartPosition] = useState<number | null>(null)
  const [isLandscape, setIsLandscape] = useState<boolean>(false)

  const prompterRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const { toast } = useToast()
  const isMobile = useMobile()
  const { t } = useI18n()

  const themeStyles = {
    light: {
      background: 'bg-white',
      text: 'text-black',
      controlsBg: 'bg-white/90',
      controlsBorder: 'border-gray-200',
      highlight: 'bg-black/5',
      marker: 'border-black/30',
    },
  }

  // 强制使用亮色主题
  useEffect(() => {
    // 设置 body 背景色为白色
    document.body.style.backgroundColor = '#ffffff'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const trackEvent = (action: string, params: { [key: string]: any } = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, params)
    }
  }

  // Load saved script from localStorage on component mount
  useEffect(() => {
    const savedScript = localStorage.getItem("teleprompterScript")
    if (savedScript) {
      setScript(savedScript)
    }
  }, [])

  // Save script to localStorage when it changes
  useEffect(() => {
    if (script !== null) {
      localStorage.setItem("teleprompterScript", script)
    }
  }, [script])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Animation loop for scrolling
  useEffect(() => {
    let lastTimestamp = 0
    const FRAME_STEP = 1000 / 60 // 60fps

    const animate = (timestamp: number) => {
      if (!prompterRef.current || !containerRef.current) return

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp
      }

      const deltaTime = timestamp - lastTimestamp
      lastTimestamp = timestamp

      // 计算新位置
      const newPosition = currentPosition + (speed * deltaTime) / 16
      setCurrentPosition(newPosition)

      const containerHeight = containerRef.current.clientHeight
      const prompterHeight = prompterRef.current.scrollHeight
      const maxScroll = prompterHeight - containerHeight

      // 计算进度
      const progress = Math.min(100, (newPosition / maxScroll) * 100)
      setProgress(progress)

      // 应用变换
      prompterRef.current.style.transform = `translateY(calc(33vh - ${newPosition}px))`

      // 到达底部时停止
      if (newPosition >= maxScroll) {
        setIsPlaying(false)
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      lastTimestamp = 0
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, speed, currentPosition])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": // Space
          e.preventDefault()
          togglePlay()
          break
        case "ArrowUp":
          e.preventDefault()
          setSpeed((prev) => Math.min(prev + 0.5, 10))
          break
        case "ArrowDown":
          e.preventDefault()
          setSpeed((prev) => Math.max(prev - 0.5, 0.5))
          break
        case "Home":
          e.preventDefault()
          resetPrompter()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPlaying])

  const togglePlay = () => {
    if (!isPlaying) {
      // 只有在位置为0时才开始倒计时
      if (currentPosition === 0) {
        trackEvent('start_prompter', { from_position: 'beginning' })
        setCountdown(3)
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdownInterval)
              setCountdown(null)
              setIsPlaying(true)
              return null
            }
            return prev ? prev - 1 : null
          })
        }, 1000)
      } else {
        // 如果不是从头开始，直接继续播放
        trackEvent('resume_prompter', { from_position: currentPosition })
        setIsPlaying(true)
      }
    } else {
      trackEvent('pause_prompter', { at_position: currentPosition })
      setIsPlaying(false)
    }
  }

  const resetPrompter = () => {
    trackEvent('reset_prompter')
    setCurrentPosition(0)
    setProgress(0)
    setIsPlaying(false)
    setCountdown(null)
    if (prompterRef.current) {
      prompterRef.current.style.transform = `
        translateY(0)
        ${isMirrored ? 'scaleX(-1)' : ''}
        ${isVerticalMirrored ? 'scaleY(-1)' : ''}
      `
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        toast({
          title: "Fullscreen Error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive",
        })
      })
    } else {
      document.exitFullscreen()
    }
  }

  const saveScript = () => {
    trackEvent('save_script', {
      script_length: script.length,
      has_content: script.length > 0
    })
    // Save to localStorage
    localStorage.setItem("teleprompterScript", script)

    // Add to history
    const now = new Date()
    const scriptHistory = JSON.parse(localStorage.getItem("teleprompterHistory") || "[]")
    const newHistoryItem = {
      id: Date.now(),
      title: script.split("\n")[0] || "Untitled Script",
      preview: script.substring(0, 100),
      date: now.toISOString(),
      content: script,
    }

    scriptHistory.unshift(newHistoryItem)
    localStorage.setItem("teleprompterHistory", JSON.stringify(scriptHistory.slice(0, 10)))

    toast({
      title: "Script Saved",
      description: "Your script has been saved successfully.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    trackEvent('upload_script', {
      file_type: file.type,
      file_size: file.size
    })

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setScript(content)
      toast({
        title: "File Uploaded",
        description: `${file.name} has been loaded successfully.`,
      })
    }
    reader.readAsText(file)

    // Reset the input value so the same file can be uploaded again
    e.target.value = ""
  }

  const downloadScript = () => {
    trackEvent('download_script', {
      script_length: script.length
    })
    const element = document.createElement("a")
    const file = new Blob([script], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "teleprompter-script.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!prompterRef.current || !containerRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const prompterHeight = prompterRef.current.scrollHeight
    const containerHeight = containerRef.current.clientHeight
    const maxScroll = prompterHeight + containerHeight
    
    const newPosition = maxScroll * clickPosition
    setCurrentPosition(newPosition)
    setProgress(clickPosition * 100)
  }

  const handleProgressBarDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setProgressBarRef(e.currentTarget)
  }

  const handleProgressBarDragEnd = () => {
    setIsDragging(false)
    setProgressBarRef(null)
  }

  const handleProgressBarDrag = (e: MouseEvent) => {
    if (!isDragging || !progressBarRef || !prompterRef.current || !containerRef.current) return

    const rect = progressBarRef.getBoundingClientRect()
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const prompterHeight = prompterRef.current.scrollHeight
    const containerHeight = containerRef.current.clientHeight
    const maxScroll = prompterHeight + containerHeight
    
    const newPosition = maxScroll * clickPosition
    setCurrentPosition(newPosition)
    setProgress(clickPosition * 100)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressBarDrag)
      window.addEventListener('mouseup', handleProgressBarDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleProgressBarDrag)
      window.removeEventListener('mouseup', handleProgressBarDragEnd)
    }
  }, [isDragging])

  // Add wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!prompterRef.current || !containerRef.current) return

      e.preventDefault()
      const prompterHeight = prompterRef.current.scrollHeight
      const containerHeight = containerRef.current.clientHeight
      const maxScroll = prompterHeight + containerHeight

      // Adjust scroll sensitivity
      const scrollSensitivity = 1.5
      const delta = e.deltaY * scrollSensitivity

      const newPosition = Math.max(0, Math.min(maxScroll, currentPosition + delta))
      setCurrentPosition(newPosition)
      setProgress((newPosition / maxScroll) * 100)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [currentPosition])

  // 修改点击事件处理
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // 如果点击的是控制条或其子元素，不处理点击事件
      if (e.target instanceof Element && 
          (e.target.closest('.controls-container') || 
           e.target.closest('button'))) {
        return
      }
      
      if (isFullscreen) {
        setIsControlsVisible(prev => !prev)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('click', handleClick)
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleClick)
      }
    }
  }, [isFullscreen])

  // 修改文本拖动功能
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target instanceof HTMLButtonElement || 
          e.target instanceof HTMLDivElement && e.target.closest('.controls-container')) {
        return
      }
      setIsDraggingText(true)
      setDragStartY(e.clientY)
      setDragStartPosition(currentPosition)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingText || dragStartY === null || dragStartPosition === null) return
      
      const deltaY = dragStartY - e.clientY
      const newPosition = Math.max(0, dragStartPosition + deltaY)
      setCurrentPosition(newPosition)

      if (prompterRef.current && containerRef.current) {
        const prompterHeight = prompterRef.current.scrollHeight
        const containerHeight = containerRef.current.clientHeight
        const maxScroll = prompterHeight - containerHeight
        setProgress((newPosition / maxScroll) * 100)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingText(false)
      setDragStartY(null)
      setDragStartPosition(null)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingText, dragStartY, dragStartPosition, currentPosition])

  // 优化触摸事件处理
  useEffect(() => {
    let initialTouchY = 0
    let initialPosition = 0
    let lastTouchY = 0
    let velocity = 0
    let lastTimestamp = 0
    let isTouching = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.target instanceof HTMLButtonElement || 
          e.target instanceof HTMLDivElement && e.target.closest('.controls-container')) {
        return
      }
      isTouching = true
      initialTouchY = e.touches[0].clientY
      lastTouchY = initialTouchY
      initialPosition = currentPosition
      lastTimestamp = performance.now()
      velocity = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching) return
      e.preventDefault()
      
      const currentTouchY = e.touches[0].clientY
      const currentTimestamp = performance.now()
      const deltaTime = currentTimestamp - lastTimestamp
      
      if (deltaTime > 0) {
        velocity = (lastTouchY - currentTouchY) / deltaTime
      }
      
      const deltaY = initialTouchY - currentTouchY
      const newPosition = Math.max(0, initialPosition + deltaY)
      
      setCurrentPosition(newPosition)

      if (prompterRef.current && containerRef.current) {
        const prompterHeight = prompterRef.current.scrollHeight
        const containerHeight = containerRef.current.clientHeight
        const maxScroll = prompterHeight - containerHeight
        setProgress((newPosition / maxScroll) * 100)
      }
      
      lastTouchY = currentTouchY
      lastTimestamp = currentTimestamp
    }

    const handleTouchEnd = () => {
      if (!isTouching) return
      isTouching = false
      
      if (Math.abs(velocity) > 0.5) {
        let currentVelocity = velocity
        const decelerate = () => {
          if (!isTouching) {
            currentVelocity *= 0.95
            
            if (Math.abs(currentVelocity) > 0.1) {
              setCurrentPosition(prev => {
                const newPos = Math.max(0, prev + currentVelocity * 16)
                if (prompterRef.current && containerRef.current) {
                  const prompterHeight = prompterRef.current.scrollHeight
                  const containerHeight = containerRef.current.clientHeight
                  const maxScroll = prompterHeight - containerHeight
                  setProgress((newPos / maxScroll) * 100)
                }
                return newPos
              })
              requestAnimationFrame(decelerate)
            }
          }
        }
        requestAnimationFrame(decelerate)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
      container.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [currentPosition])

  // 添加镜像模式变更追踪
  useEffect(() => {
    trackEvent('mirror_mode_change', {
      horizontal: isMirrored,
      vertical: isVerticalMirrored
    })
  }, [isMirrored, isVerticalMirrored])

  // 添加字体大小变更追踪
  useEffect(() => {
    trackEvent('font_size_change', {
      size: fontSize
    })
  }, [fontSize])

  // 添加行高变更追踪
  useEffect(() => {
    trackEvent('line_height_change', {
      height: lineHeight
    })
  }, [lineHeight])

  // 添加对齐方式变更追踪
  useEffect(() => {
    trackEvent('text_align_change', {
      align: textAlign
    })
  }, [textAlign])

  // 添加横屏检测
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight)
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <Tabs defaultValue="edit" className={cn(
        "w-full",
        isLandscape && isMobile && "hidden"
      )}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">{t('prompter.edit')}</TabsTrigger>
          <TabsTrigger value="prompter">{t('prompter.play')}</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button onClick={saveScript} size="sm" className="gap-1 text-xs sm:text-sm">
                <Save className="h-3 w-3 sm:h-4 sm:w-4" /> {t('common.save')}
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm" asChild>
                <label>
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" /> {t('common.import')}
                  <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
                </label>
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm" onClick={downloadScript} disabled={!script}>
                <Download className="h-3 w-3 sm:h-4 sm:w-4" /> {t('common.export')}
              </Button>
            </div>

            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[200px] sm:min-h-[300px] font-mono whitespace-pre-wrap"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                color: '#000000',
              }}
              placeholder={t('prompter.placeholder')}
            />
          </div>
        </TabsContent>

        <TabsContent value="prompter" className={cn(
          isLandscape && isMobile && "!mt-0 !block"
        )}>
          {/* Prompter container */}
          <div
            ref={containerRef}
            className={cn(
              "relative overflow-hidden touch-none bg-white",
              isFullscreen ? "h-screen" : 
              isLandscape && isMobile ? "h-screen" :
              "h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]"
            )}
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {countdown !== null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-white/80 z-50">
                <span className="text-4xl sm:text-6xl font-bold mb-4 text-black">{countdown}</span>
                <div className="text-xs sm:text-sm text-center text-black">
                  <p>{t('countdown.preparing')}</p>
                  <p className="mt-2">{t('countdown.spaceKey')}</p>
                  <p>{t('countdown.clickScreen')}</p>
                </div>
              </div>
            ) : (
              <>
                {/* 提示条 - 始终显示 */}
                <div className="absolute left-0 right-0 top-[33vh] h-16 bg-black/5 pointer-events-none z-10" />
                <div className="absolute left-0 right-0 top-[33vh] border-t-2 border-black/30 pointer-events-none z-10" />

                {/* 文本容器 */}
                <div
                  ref={prompterRef}
                  className={cn(
                    "absolute w-full whitespace-pre-wrap break-words",
                    textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center',
                    "p-4 sm:p-6"
                  )}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    transform: 'translateY(33vh)',
                    color: "#000000",
                    backgroundColor: "#ffffff",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {script}
                </div>

                {/* 控制栏 */}
                {(isControlsVisible || !isPlaying) && (
                  <div className="controls-container absolute bottom-0 left-0 right-0 backdrop-blur-sm p-1 sm:p-2 border-t bg-white/90 border-gray-200 z-20">
                    <div className="flex flex-wrap gap-1 sm:gap-2 items-center justify-between">
                      {/* Playback controls */}
                      <div className="flex gap-1 sm:gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 sm:h-10 sm:w-10",
                            isMobile && "h-10 w-10"
                          )}
                          onClick={togglePlay}
                        >
                          {isPlaying ? 
                            <Pause className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} /> : 
                            <Play className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          }
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 sm:h-10 sm:w-10",
                            isMobile && "h-10 w-10"
                          )}
                          onClick={resetPrompter}
                        >
                          <RotateCcw className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 sm:h-10 sm:w-10",
                            isMobile && "h-10 w-10"
                          )}
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? 
                            <Minimize className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} /> : 
                            <Maximize className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          }
                        </Button>
                        {/* Speed controls */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setSpeed(prev => Math.max(prev - 0.5, 0.5))}
                          >
                            <ChevronDown className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          </Button>
                          <span className={cn(
                            "text-[10px] sm:text-xs w-6 text-center",
                            isMobile && "text-xs w-8"
                          )}>{speed.toFixed(1)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setSpeed(prev => Math.min(prev + 0.5, 10))}
                          >
                            <ChevronUp className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          </Button>
                        </div>
                      </div>

                      {/* Text controls */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setIsMirrored(prev => !prev)}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>↔</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setIsVerticalMirrored(prev => !prev)}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>↕</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setFontSize((prev) => Math.max(prev - 4, 16))}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>A-</span>
                          </Button>
                          <span className={cn(
                            "text-[10px] sm:text-xs w-5 sm:w-6 text-center",
                            isMobile && "text-xs w-8"
                          )}>{fontSize}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setFontSize((prev) => Math.min(prev + 4, 72))}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>A+</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setLineHeight((prev) => Math.max(prev - 0.1, 1.2))}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>↕-</span>
                          </Button>
                          <span className={cn(
                            "text-[10px] sm:text-xs w-6 sm:w-8 text-center",
                            isMobile && "text-xs w-10"
                          )}>{lineHeight.toFixed(1)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setLineHeight((prev) => Math.min(prev + 0.1, 2.0))}
                          >
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              isMobile && "text-xs"
                            )}>↕+</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setTextAlign('left')}
                          >
                            <AlignLeft className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setTextAlign('center')}
                          >
                            <AlignCenter className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "h-8 w-8 sm:h-10 sm:w-10",
                              isMobile && "h-10 w-10"
                            )}
                            onClick={() => setTextAlign('right')}
                          >
                            <AlignRight className={cn("h-3 w-3 sm:h-4 sm:w-4", isMobile && "h-4 w-4")} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive progress bar */}
                    <div
                      className="mt-2 sm:mt-3 h-1 sm:h-2 w-full bg-secondary rounded-full overflow-hidden cursor-pointer"
                      onClick={handleProgressBarClick}
                      onMouseDown={handleProgressBarDragStart}
                    >
                      <div
                        className="h-full bg-black transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isFullscreen && (
            <Card className="mt-2 sm:mt-4 bg-white text-black">
              <CardContent className="p-2 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium mb-2">{t('shortcuts.title')}</h3>
                {/* PC端提示 */}
                {!isMobile && (
                  <div className="space-y-1">
                    <h4 className="text-[10px] sm:text-xs font-medium text-muted-foreground">{t('shortcuts.pc.title')}</h4>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <div>{t('shortcuts.space')}</div>
                      <div>{t('shortcuts.arrows')}</div>
                      <div>{t('shortcuts.home')}</div>
                      <div>{t('shortcuts.f')}</div>
                      <div>{t('shortcuts.pc.mouse')}</div>
                      <div>{t('shortcuts.pc.wheel')}</div>
                    </div>
                  </div>
                )}
                {/* 触屏设备提示 */}
                {isMobile && (
                  <div className="space-y-1">
                    <h4 className="text-[10px] sm:text-xs font-medium text-muted-foreground">{t('shortcuts.touch.title')}</h4>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <div>{t('shortcuts.touch.drag')}</div>
                      <div>{t('shortcuts.touch.tap')}</div>
                      <div>{t('shortcuts.touch.pinch')}</div>
                      <div>{t('shortcuts.touch.controls')}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

