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
    const FRAME_RATE = 60 // 限制帧率
    const FRAME_INTERVAL = 1000 / FRAME_RATE

    const animate = (timestamp: number) => {
      if (!prompterRef.current || !containerRef.current) return

      // 帧率控制
      const elapsed = timestamp - lastTimestamp
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastTimestamp = timestamp

      const containerHeight = containerRef.current.clientHeight
      const prompterHeight = prompterRef.current.scrollHeight
      const maxScroll = prompterHeight - containerHeight

      // 使用 transform 代替 scrollTop，提供更流畅的动画
      const newPosition = currentPosition + speed * (elapsed / 16) // 基于时间的平滑动画
      setCurrentPosition(Math.min(newPosition, maxScroll))

      // 计算进度
      const progress = Math.min(100, (newPosition / maxScroll) * 100)
      setProgress(progress)

      // 应用变换
      prompterRef.current.style.transform = `
        translate3d(0, ${-newPosition}px, 0)
        ${isMirrored ? "scaleX(-1)" : ""}
        ${isVerticalMirrored ? "scaleY(-1)" : ""}
        rotateX(10deg)
      `

      // 到达底部时停止
      if (newPosition >= maxScroll) {
        setIsPlaying(false)
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      lastTimestamp = performance.now()
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
        translate3d(0, 0, 0)
        ${isMirrored ? "scaleX(-1)" : ""}
        ${isVerticalMirrored ? "scaleY(-1)" : ""}
        rotateX(10deg)
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

  // 优化触摸事件处理
  useEffect(() => {
    let initialTouchY = 0
    let initialPosition = 0
    let lastTouchY = 0
    let velocity = 0
    let lastTimestamp = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (isPlaying) {
        setIsPlaying(false)
      }
      initialTouchY = e.touches[0].clientY
      lastTouchY = initialTouchY
      initialPosition = currentPosition
      lastTimestamp = performance.now()
      velocity = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const currentTouchY = e.touches[0].clientY
      const currentTimestamp = performance.now()
      const deltaTime = currentTimestamp - lastTimestamp
      
      // 计算速度
      if (deltaTime > 0) {
        velocity = (lastTouchY - currentTouchY) / deltaTime
      }
      
      const deltaY = initialTouchY - currentTouchY
      const newPosition = Math.max(0, initialPosition + deltaY)
      
      setCurrentPosition(newPosition)
      
      lastTouchY = currentTouchY
      lastTimestamp = currentTimestamp
    }

    const handleTouchEnd = () => {
      // 添加惯性滚动
      if (Math.abs(velocity) > 0.5) {
        let currentVelocity = velocity
        const decelerate = () => {
          currentVelocity *= 0.95 // 减速因子
          
          if (Math.abs(currentVelocity) > 0.1) {
            setCurrentPosition(prev => Math.max(0, prev + currentVelocity * 16))
            requestAnimationFrame(decelerate)
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
  }, [currentPosition, isPlaying])

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

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <Tabs defaultValue="edit" className="w-full">
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
              className="min-h-[200px] sm:min-h-[300px]"
              placeholder={t('prompter.placeholder')}
            />
          </div>
        </TabsContent>

        <TabsContent value="prompter">
          <div 
            ref={containerRef} 
            className={cn(
              "relative h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden bg-white touch-none",
              themeStyles[theme].background,
              isFullscreen ? "h-screen" : ""
            )}
            style={{
              perspective: "1000px",
              perspectiveOrigin: "center center",
              WebkitOverflowScrolling: "touch", // 添加 iOS 滚动优化
            }}
          >
            {countdown !== null ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-white/80">
                <span className="text-4xl sm:text-6xl font-bold mb-4 text-black">{countdown}</span>
                <div className="text-xs sm:text-sm text-center text-black">
                  <p>{t('countdown.preparing')}</p>
                  <p className="mt-2">{t('countdown.spaceKey')}</p>
                  <p>{t('countdown.clickScreen')}</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  ref={prompterRef}
                  className={cn(
                    "absolute w-full transform-gpu will-change-transform",
                    textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center',
                    "p-2 sm:p-4"
                  )}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    transform: `
                      translate3d(0, 0, 0)
                      ${isMirrored ? "scaleX(-1)" : ""}
                      ${isVerticalMirrored ? "scaleY(-1)" : ""}
                      rotateX(10deg)
                    `,
                    transformOrigin: "center top",
                    WebkitFontSmoothing: "antialiased",
                  }}
                >
                  {script}
                </div>

                {/* Center marker and highlight zone */}
                <div className="absolute left-0 right-0 top-[33vh] h-16 bg-black/5 pointer-events-none" />
                <div className="absolute left-0 right-0 top-[33vh] border-t-2 border-black/30 pointer-events-none" />

                {/* Controls */}
                {(isControlsVisible || !isPlaying) && (
                  <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm p-2 sm:p-4 border-t bg-white/90 border-gray-200">
                    <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
                      {/* Playback controls */}
                      <div className="flex gap-1 sm:gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={togglePlay}>
                          {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={resetPrompter}>
                          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={toggleFullscreen}>
                          {isFullscreen ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                      </div>

                      {/* Text controls */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setIsMirrored(prev => !prev)}
                          >
                            <span className="text-[10px] sm:text-xs">↔</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setIsVerticalMirrored(prev => !prev)}
                          >
                            <span className="text-[10px] sm:text-xs">↕</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setFontSize((prev) => Math.max(prev - 4, 16))}
                          >
                            <span className="text-[10px] sm:text-xs">A-</span>
                          </Button>
                          <span className="text-[10px] sm:text-xs w-6 sm:w-8 text-center">{fontSize}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setFontSize((prev) => Math.min(prev + 4, 72))}
                          >
                            <span className="text-[10px] sm:text-xs">A+</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setLineHeight((prev) => Math.max(prev - 0.1, 1.2))}
                          >
                            <span className="text-[10px] sm:text-xs">↕-</span>
                          </Button>
                          <span className="text-[10px] sm:text-xs w-8 sm:w-12 text-center">{lineHeight.toFixed(1)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setLineHeight((prev) => Math.min(prev + 0.1, 2.0))}
                          >
                            <span className="text-[10px] sm:text-xs">↕+</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setTextAlign('left')}
                          >
                            <AlignLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setTextAlign('center')}
                          >
                            <AlignCenter className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => setTextAlign('right')}
                          >
                            <AlignRight className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive progress bar */}
                    <div 
                      className="mt-2 sm:mt-4 h-1.5 sm:h-2 w-full bg-secondary rounded-full overflow-hidden cursor-pointer"
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <div>{t('shortcuts.space')}</div>
                  <div>{t('shortcuts.arrows')}</div>
                  <div>{t('shortcuts.home')}</div>
                  <div>{t('shortcuts.f')}</div>
                  <div>{t('shortcuts.click')}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

