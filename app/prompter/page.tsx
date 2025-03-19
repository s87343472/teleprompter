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
    const animate = () => {
      if (prompterRef.current && containerRef.current) {
        const containerHeight = containerRef.current.clientHeight
        const prompterHeight = prompterRef.current.scrollHeight

        // Calculate new position
        const newPosition = currentPosition + speed * 0.1
        setCurrentPosition(newPosition)

        // Calculate progress percentage
        const maxScroll = prompterHeight + containerHeight
        const currentProgress = Math.min(100, (newPosition / maxScroll) * 100)
        setProgress(currentProgress)

        // Stop if we've reached the end
        if (newPosition >= maxScroll) {
          setIsPlaying(false)
          return
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
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
        setIsPlaying(true)
      }
    } else {
      setIsPlaying(false)
    }
  }

  const resetPrompter = () => {
    setCurrentPosition(0)
    setProgress(0)
    setIsPlaying(false)
    setCountdown(null)
    if (prompterRef.current) {
      prompterRef.current.style.transform = "translateY(0)"
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

  // Add touch event handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY)
      setTouchStartPosition(currentPosition)
      if (isPlaying) {
        setIsPlaying(false)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || touchStartPosition === null || !prompterRef.current || !containerRef.current) return

      e.preventDefault()
      const touchDelta = e.touches[0].clientY - touchStartY
      const prompterHeight = prompterRef.current.scrollHeight
      const containerHeight = containerRef.current.clientHeight
      const maxScroll = prompterHeight + containerHeight

      // Adjust touch sensitivity
      const touchSensitivity = 2
      const newPosition = Math.max(0, Math.min(maxScroll, touchStartPosition - touchDelta * touchSensitivity))
      setCurrentPosition(newPosition)
      setProgress((newPosition / maxScroll) * 100)
    }

    const handleTouchEnd = () => {
      setTouchStartY(null)
      setTouchStartPosition(null)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart)
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
  }, [currentPosition, touchStartY, touchStartPosition, isPlaying])

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
            className="relative h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden bg-white touch-none"
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
                    "absolute w-full transform-gpu transition-transform duration-100 whitespace-pre-wrap break-words text-black",
                    textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center',
                    "p-2 sm:p-4"
                  )}
                  style={{
                    transform: `translateY(calc(33vh - ${currentPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
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

