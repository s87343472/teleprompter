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
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useI18n } from "@/app/i18n/context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Lenis from 'lenis'

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
  const [autoSave, setAutoSave] = useState<boolean>(true)
  const [estimatedTime, setEstimatedTime] = useState<number>(0)

  const prompterRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const currentPositionRef = useRef<number>(0) // 添加引用来存储当前位置
  const { toast } = useToast()
  const isMobile = useMobile()
  const { t } = useI18n()

  // 使用Lenis滚动库的引用
  const lenisRef = useRef<Lenis | null>(null)

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

  // 从localStorage加载设置
  useEffect(() => {
    try {
      // 加载保存的设置
      const savedSettings = localStorage.getItem("teleprompterSettings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        if (settings.fontSize) setFontSize(settings.fontSize)
        if (settings.scrollSpeed) setSpeed(settings.scrollSpeed)
        if (settings.lineHeight) setLineHeight(settings.lineHeight)
        if (settings.textAlign) setTextAlign(settings.textAlign)
        if (settings.autoSave !== undefined) setAutoSave(settings.autoSave)
      }

      // 加载保存的脚本
      const savedScript = localStorage.getItem("teleprompterScript")
      if (savedScript) {
        setScript(savedScript)
      }
    } catch (error) {
      console.error("Error loading settings or script:", error)
    }
  }, [])

  // 确保DOM元素加载完成后初始化
  useEffect(() => {
    // 检查DOM元素是否已准备好
    const checkRefsReady = () => {
      if (prompterRef.current && containerRef.current) {
        // 初始化提词器位置
        prompterRef.current.style.transform = `translateY(25vh) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
        return true
      }
      return false
    }
    
    // 如果DOM元素未准备好，每100ms检查一次
    if (!checkRefsReady()) {
      const interval = setInterval(() => {
        if (checkRefsReady()) {
          clearInterval(interval)
        }
      }, 100)
      
      // 最多尝试50次（5秒）
      setTimeout(() => clearInterval(interval), 5000)
      
      return () => clearInterval(interval)
    }
  }, [isMirrored, isVerticalMirrored])

  // 自动保存脚本
  useEffect(() => {
    if (autoSave && script.trim()) {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem("teleprompterScript", script)
      }, 1000) // 延迟1秒保存，避免频繁保存

      return () => clearTimeout(saveTimeout)
    }
  }, [script, autoSave])

  // 保存脚本到历史记录
  const saveToHistory = () => {
    if (!script.trim()) return

    try {
      // 加载现有历史记录
      const savedHistory = localStorage.getItem("teleprompterHistory") || "[]"
      const history = JSON.parse(savedHistory)

      // 创建新的历史记录项
      const newItem = {
        id: Date.now(),
        title: script.split('\n')[0].substring(0, 50) || "无标题脚本",
        preview: script.substring(0, 100),
        date: new Date().toISOString(),
        content: script
      }

      // 添加到历史记录开头
      const newHistory = [newItem, ...history.slice(0, 19)] // 最多保存20条记录
      localStorage.setItem("teleprompterHistory", JSON.stringify(newHistory))

      toast({
        title: t('prompter.savedToHistory'),
        description: t('prompter.savedToHistoryDescription'),
      })
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  }

  const saveScript = () => {
    if (!script.trim()) {
      toast({
        title: t('prompter.emptyScript'),
        description: t('prompter.emptyScriptDescription'),
        variant: "destructive"
      })
      return
    }

    localStorage.setItem("teleprompterScript", script)
    saveToHistory()
  }

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

  // 计算最终位置
  const calculateFinalPosition = () => {
    if (!prompterRef.current || !containerRef.current) return 0
    
    const containerHeight = containerRef.current.clientHeight
    const prompterHeight = prompterRef.current.scrollHeight
    
    // 解析文本内容，计算实际行数
    const lines = script.split('\n')
    const lineCount = lines.length
    
    // 计算提示条位置（容器高度的25%处）
    const markerPosition = containerHeight * 0.25
    
    // 直接计算最大滚动距离
    const maxScroll = Math.max(1, prompterHeight - containerHeight)
    
    // 确保有额外的空间显示最后几行文本
    const extraPadding = containerHeight * 0.75
    
    if (lineCount === 16) {
      // 对16行的特殊处理
      // 计算每行的平均高度
      const lineHeight = (prompterHeight - 64) / 16 // 减去padding
      
      // 我们希望第16行显示在提示条位置，需要额外滚动的距离
      // 公式：第16行的顶部位置减去提示条位置
      // 第16行的顶部位置 = 前15行的高度 = 15 * lineHeight
      const line16TopPosition = 15 * lineHeight
      
      // 额外的偏移量，将第16行对齐到提示条
      const extraOffset = line16TopPosition - markerPosition + extraPadding
      
      return maxScroll + extraOffset
    } else {
      // 通用滚动计算
      // 对于其他行数，使用容器高度的一部分作为额外偏移量
      return maxScroll + extraPadding
    }
  }

  // 初始化Lenis滚动库
  useEffect(() => {
    if (!containerRef.current) return

    // 创建新的Lenis实例
    lenisRef.current = new Lenis({
      wrapper: containerRef.current as HTMLElement,
      content: prompterRef.current as HTMLElement || undefined,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // 触摸设备使用原生滚动
      touchMultiplier: 2,
    })
    
    // 设置Lenis的RAF循环
    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time)
      }
      requestAnimationFrame(raf)
    }
    
    requestAnimationFrame(raf)

    // 清理函数
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  // 同步ref和state
  useEffect(() => {
    currentPositionRef.current = currentPosition;
  }, [currentPosition]);

  // 使用普通方法处理滚动动画，不依赖Lenis的scrollTo
  useEffect(() => {
    if (!prompterRef.current || !containerRef.current) return
    
    let animationId: number | null = null
    const maxScroll = calculateFinalPosition()
    
    // 滚动更新函数
    function update() {
      if (isPlaying) {
        // 获取当前位置
        const currentPos = currentPositionRef.current
        
        // 计算要滚动的量
        let scrollAmount = speed * 0.05
        
        // 如果接近结束位置，应用减速
        if (currentPos > maxScroll * 0.95) {
          const remainingDistance = maxScroll - currentPos
          const slowdownFactor = Math.max(0.1, remainingDistance / (maxScroll * 0.05))
          scrollAmount *= slowdownFactor
          
          // 如果非常接近最终位置，停止滚动
          if (remainingDistance < 5) {
            setIsPlaying(false)
            setCurrentPosition(maxScroll)
            currentPositionRef.current = maxScroll
            setProgress(100)
            
            // 手动设置最终位置
            if (prompterRef.current) {
              prompterRef.current.style.transform = `translateY(calc(25vh - ${maxScroll}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
            }
            
            return
          }
        }
        
        // 计算新位置
        const newPosition = Math.min(maxScroll, currentPos + scrollAmount)
        
        // 更新状态和ref
        setCurrentPosition(newPosition)
        currentPositionRef.current = newPosition
        
        // 计算和更新进度
        const progressPercent = (newPosition / maxScroll) * 100
        setProgress(progressPercent)
        
        // 更新提词器位置
        if (prompterRef.current) {
          prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
        }
        
        // 同步Lenis滚动位置
        if (lenisRef.current) {
          lenisRef.current.scrollTo(newPosition, { immediate: true })
        }
      }
      
      animationId = requestAnimationFrame(update)
    }
    
    if (isPlaying) {
      animationId = requestAnimationFrame(update)
    }
    
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying, speed, isMirrored, isVerticalMirrored, script])

  // 计算预估播放时间
  useEffect(() => {
    if (prompterRef.current && containerRef.current) {
      const prompterHeight = prompterRef.current.scrollHeight
      const containerHeight = containerRef.current.clientHeight
      const maxScroll = calculateFinalPosition()
      const remainingScroll = maxScroll - currentPosition
      
      // 每秒滚动的像素数 = 速度值 * 基础速度系数
      const pixelsPerSecond = speed * 60 / 16
      
      if (pixelsPerSecond > 0) {
        // 剩余时间(秒) = 剩余滚动距离 / 每秒滚动速度
        const timeInSeconds = remainingScroll / pixelsPerSecond
        setEstimatedTime(Math.max(0, Math.round(timeInSeconds)))
      }
    }
  }, [speed, currentPosition, script])

  // 格式化时间为分:秒格式
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
    // 确保DOM元素已准备好
    if (!prompterRef.current || !containerRef.current) {
      console.warn("DOM elements not ready yet, retrying...")
      // 延迟100ms后重试
      setTimeout(togglePlay, 100)
      return
    }

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
    currentPositionRef.current = 0
    setProgress(0)
    setIsPlaying(false)
    setCountdown(null)
    
    // 重置Lenis滚动位置
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    
    // 确保DOM元素已准备好
    if (prompterRef.current) {
      // 使用单一的transform属性设置所有变换
      prompterRef.current.style.transform = `translateY(25vh) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
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

  // 修改点击事件处理，避免滚动区域与进度条互相干扰
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // 如果点击的是控制条、进度条或按钮，不处理点击事件
      if (e.target instanceof Element && 
          (e.target.closest('.controls-container') || 
           e.target.closest('.progress-bar-container') ||
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

  // 修改进度条点击处理
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止事件冒泡，避免点击进度条时触发容器的事件
    e.stopPropagation()
    
    if (!prompterRef.current || !containerRef.current || !lenisRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const finalPosition = calculateFinalPosition()
    
    let newPosition = finalPosition * clickPosition
    
    // 如果点击接近进度条末尾(95%以上)，确保显示到文本最后
    if (clickPosition >= 0.95) {
      newPosition = finalPosition
    }
    
    // 使用Lenis滚动到指定位置
    lenisRef.current.scrollTo(newPosition, { immediate: true })
    
    // 更新状态和ref
    setCurrentPosition(newPosition)
    currentPositionRef.current = newPosition
    setProgress(clickPosition * 100)
    
    // 更新提词器位置
    if (prompterRef.current) {
      prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
    }
  }

  // 进度条拖动开始
  const handleProgressBarDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止事件冒泡，避免拖动进度条时触发容器的事件
    e.stopPropagation()
    setIsDragging(true)
    setProgressBarRef(e.currentTarget)
  }

  // 进度条拖动结束
  const handleProgressBarDragEnd = () => {
    setIsDragging(false)
    setProgressBarRef(null)
  }

  // 进度条拖动
  const handleProgressBarDrag = (e: MouseEvent) => {
    if (!isDragging || !progressBarRef || !prompterRef.current || !containerRef.current || !lenisRef.current) return

    const rect = progressBarRef.getBoundingClientRect()
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const finalPosition = calculateFinalPosition()
    
    let newPosition = finalPosition * clickPosition
    
    // 如果拖拽到接近末尾，确保显示全部文本
    if (clickPosition >= 0.95) {
      newPosition = finalPosition
    }
    
    // 使用Lenis滚动到指定位置
    lenisRef.current.scrollTo(newPosition, { immediate: true })
    
    // 更新状态和ref
    setCurrentPosition(newPosition)
    currentPositionRef.current = newPosition
    setProgress(clickPosition * 100)
    
    // 更新提词器位置
    if (prompterRef.current) {
      prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
    }
  }

  // 进度条拖动事件监听
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

  // 滚轮事件处理
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      if (!prompterRef.current || !containerRef.current || !lenisRef.current) return
      
      const finalPosition = calculateFinalPosition()
      
      // 如果播放已完成并滚动到了最后，禁止进一步滚动
      if (currentPositionRef.current >= finalPosition * 0.99) {
        return
      }
      
      // 滚轮的deltaY是滚动方向和强度
      const direction = e.deltaY > 0 ? 1 : -1
      const scrollSensitivity = 2.0
      
      // 计算要滚动的量
      let scrollDelta = direction * scrollSensitivity
      
      // 如果接近结束位置，应用减速
      if (currentPositionRef.current > finalPosition * 0.9) {
        const remainingDistance = finalPosition - currentPositionRef.current
        const slowdownFactor = Math.max(0.1, remainingDistance / (finalPosition * 0.1))
        scrollDelta *= slowdownFactor
      }
      
      // 计算新位置
      let newPosition = currentPositionRef.current + scrollDelta
      
      // 限制位置范围
      newPosition = Math.max(0, Math.min(finalPosition, newPosition))
      
      // 如果非常接近最终位置，直接设置为最终位置
      if (finalPosition - newPosition < 2 && direction > 0) {
        newPosition = finalPosition
        setProgress(100)
      } else {
        // 计算进度
        const progressPercentage = (newPosition / finalPosition) * 100
        setProgress(progressPercentage)
      }
      
      // 使用Lenis平滑滚动到新位置
      lenisRef.current.scrollTo(newPosition, { immediate: true })
      
      // 更新当前位置和ref
      setCurrentPosition(newPosition)
      currentPositionRef.current = newPosition
      
      // 更新提词器位置
      if (prompterRef.current) {
        prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
      }
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
  }, [isMirrored, isVerticalMirrored])

  // 文本拖动功能
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 如果点击的是控制条、进度条或按钮，不处理点击事件
      if (e.target instanceof Element && 
          (e.target.closest('.controls-container') || 
           e.target.closest('.progress-bar-container') ||
           e.target.closest('button'))) {
        return
      }
      
      // 如果已经滚动到最后，不允许进一步拖动
      const finalPosition = calculateFinalPosition()
      if (currentPositionRef.current >= finalPosition * 0.99) {
        return
      }
      
      setIsDraggingText(true)
      setDragStartY(e.clientY)
      setDragStartPosition(currentPositionRef.current)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingText || dragStartY === null || dragStartPosition === null) return
      
      const deltaY = dragStartY - e.clientY
      
      if (!prompterRef.current || !containerRef.current || !lenisRef.current) return
      
      const finalPosition = calculateFinalPosition()
      
      // 计算初步拖动位置
      let newPosition = dragStartPosition + deltaY
      
      // 如果接近结束位置，应用平滑减速
      if (newPosition > finalPosition * 0.9) {
        // 计算距离完成的比例
        const remainingDistance = finalPosition - newPosition
        const slowdownFactor = Math.max(0.2, remainingDistance / (finalPosition * 0.1))
        
        // 应用减速
        newPosition = dragStartPosition + (deltaY * slowdownFactor)
      }
      
      // 限制拖动范围
      newPosition = Math.max(0, Math.min(finalPosition, newPosition))
      
      // 如果非常接近最终位置，直接设置为最终位置
      if (finalPosition - newPosition < 5 && deltaY > 0) {
        newPosition = finalPosition
        setProgress(100)
      } else {
        // 计算进度
        const progressPercentage = (newPosition / finalPosition) * 100
        setProgress(progressPercentage)
      }
      
      // 使用Lenis平滑滚动到新位置
      lenisRef.current.scrollTo(newPosition, { immediate: true })
      
      // 更新当前位置和ref
      setCurrentPosition(newPosition)
      currentPositionRef.current = newPosition
      
      // 更新提词器位置
      if (prompterRef.current) {
        prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
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
  }, [isDraggingText, dragStartY, dragStartPosition, isMirrored, isVerticalMirrored])

  // 优化触摸事件处理
  useEffect(() => {
    let initialTouchY = 0
    let initialPosition = 0
    let lastTouchY = 0
    let velocity = 0
    let lastTimestamp = 0
    let isTouching = false

    const handleTouchStart = (e: TouchEvent) => {
      // 如果点击的是控制条或其子元素，不处理触摸事件
      if (e.target instanceof Element && 
          (e.target.closest('.controls-container') || 
           e.target.closest('.progress-bar-container') ||
           e.target.closest('button'))) {
        return
      }
      
      const finalPosition = calculateFinalPosition()
      
      // 如果已经滚动到最后，不允许进一步触摸滚动
      if (currentPositionRef.current >= finalPosition * 0.99) {
        return
      }
      
      isTouching = true
      initialTouchY = e.touches[0].clientY
      lastTouchY = initialTouchY
      initialPosition = currentPositionRef.current
      lastTimestamp = performance.now()
      velocity = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || !lenisRef.current) return
      e.preventDefault()
      
      const currentTouchY = e.touches[0].clientY
      const currentTimestamp = performance.now()
      const deltaTime = currentTimestamp - lastTimestamp
      
      if (deltaTime > 0) {
        // 计算速度（像素/毫秒）
        velocity = (lastTouchY - currentTouchY) / deltaTime
      }
      
      // 计算触摸移动距离
      const deltaY = initialTouchY - currentTouchY
      
      if (!prompterRef.current || !containerRef.current) return
      
      const finalPosition = calculateFinalPosition()
      
      // 计算新位置
      let newPosition = initialPosition + deltaY
      
      // 如果接近结束位置，应用平滑减速
      if (newPosition > finalPosition * 0.9) {
        // 计算距离完成的比例
        const remainingDistance = finalPosition - newPosition
        const slowdownFactor = Math.max(0.2, remainingDistance / (finalPosition * 0.1))
        
        // 应用减速
        newPosition = initialPosition + (deltaY * slowdownFactor)
      }
      
      // 限制位置范围
      newPosition = Math.max(0, Math.min(finalPosition, newPosition))
      
      // 如果非常接近最终位置，直接设置为最终位置
      if (finalPosition - newPosition < 5 && deltaY > 0) {
        newPosition = finalPosition
        setProgress(100)
      } else {
        // 计算进度
        const progressPercentage = (newPosition / finalPosition) * 100
        setProgress(progressPercentage)
      }
      
      // 使用Lenis平滑滚动到新位置
      lenisRef.current.scrollTo(newPosition, { immediate: true })
      
      // 更新当前位置和ref
      setCurrentPosition(newPosition)
      currentPositionRef.current = newPosition
      
      // 更新提词器位置
      if (prompterRef.current) {
        prompterRef.current.style.transform = `translateY(calc(25vh - ${newPosition}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
      }
      
      lastTouchY = currentTouchY
      lastTimestamp = currentTimestamp
    }

    const handleTouchEnd = () => {
      if (!isTouching || !lenisRef.current) return
      isTouching = false
      
      const finalPosition = calculateFinalPosition()
      
      // 如果已经滚动到最后，停止惯性滚动
      if (currentPositionRef.current >= finalPosition * 0.99) {
        return
      }
      
      // 应用惯性滚动
      if (Math.abs(velocity) > 0.05) {
        let currentVelocity = velocity * 120 // 放大效果
        const decelerate = () => {
          if (isTouching) return // 如果用户再次触摸，停止惯性滚动
          
          // 减速因子
          currentVelocity *= 0.95
          
          if (Math.abs(currentVelocity) > 0.01) {
            // 获取当前位置
            const currentPos = currentPositionRef.current
            
            // 计算新位置
            let newPos = currentPos + currentVelocity
            
            // 如果接近结束位置，应用平滑减速
            if (newPos > finalPosition * 0.9) {
              const remainingDistance = finalPosition - newPos
              const slowdownFactor = Math.max(0.1, remainingDistance / (finalPosition * 0.1))
              newPos = currentPos + (currentVelocity * slowdownFactor)
            }
            
            // 限制位置范围
            newPos = Math.max(0, Math.min(finalPosition, newPos))
            
            // 如果非常接近最终位置，直接设置为最终位置并停止惯性滚动
            if (finalPosition - newPos < 2 && velocity > 0) {
              newPos = finalPosition
              setCurrentPosition(newPos)
              currentPositionRef.current = newPos
              setProgress(100)
              
              // 更新提词器位置
              if (prompterRef.current) {
                prompterRef.current.style.transform = `translateY(calc(25vh - ${newPos}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
              }
              
              return
            }
            
            // 设置新位置
            if (lenisRef.current) {
              lenisRef.current.scrollTo(newPos, { immediate: true })
            }
            
            // 更新状态和ref
            setCurrentPosition(newPos)
            currentPositionRef.current = newPos
            
            // 计算进度
            const progressPercentage = (newPos / finalPosition) * 100
            setProgress(progressPercentage)
            
            // 更新提词器位置
            if (prompterRef.current) {
              prompterRef.current.style.transform = `translateY(calc(25vh - ${newPos}px)) ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
            }
            
            // 继续惯性滚动
            requestAnimationFrame(decelerate)
          }
        }
        
        // 开始惯性滚动
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
  }, [isMirrored, isVerticalMirrored, script])

  // 镜像模式变更
  useEffect(() => {
    trackEvent('mirror_mode_change', {
      horizontal: isMirrored,
      vertical: isVerticalMirrored
    })
    
    // 确保镜像模式变化后立即应用到文本上
    if (prompterRef.current) {
      // 获取当前的位置信息
      const currentTransform = prompterRef.current.style.transform
      const translateYMatch = currentTransform.match(/translateY\([^)]+\)/)
      const translateY = translateYMatch ? translateYMatch[0] : 'translateY(25vh)'
      
      // 应用新的变换，保持原有的位置信息
      prompterRef.current.style.transform = `${translateY} ${isMirrored ? 'scaleX(-1)' : ''} ${isVerticalMirrored ? 'scaleY(-1)' : ''}`
    }
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
      <h1 className="sr-only">提词器编辑器</h1>
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
            id="prompter-container" // 添加ID方便调试
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
                <div className="absolute left-0 right-0 top-[25vh] h-16 bg-black/5 pointer-events-none z-10" />
                <div className="absolute left-0 right-0 top-[25vh] border-t-2 border-black/30 pointer-events-none z-10" />

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
                    transform: 'translateY(25vh)',
                    color: "#000000",
                    backgroundColor: "#ffffff",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    padding: "32px 16px", // 确保文本有足够的上下padding
                    paddingBottom: "100vh" // 添加非常大的底部padding确保最后一行可以滚动到视图中央
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
                        {/* 时间预估显示 */}
                        <div className="flex items-center ml-2">
                          <Clock className={cn("h-3 w-3 sm:h-4 sm:w-4 mr-1 text-muted-foreground", isMobile && "h-4 w-4")} />
                          <span className={cn(
                            "text-[10px] sm:text-xs text-muted-foreground",
                            isMobile && "text-xs"
                          )}>{formatTime(estimatedTime)}</span>
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
                      className="progress-bar-container mt-2 sm:mt-3 h-1 sm:h-2 w-full bg-secondary rounded-full overflow-hidden cursor-pointer"
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

