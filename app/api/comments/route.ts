import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// 评论存储路径
const COMMENTS_FILE = path.join(process.cwd(), "data", "comments.json")

// 确保数据目录和文件存在
function ensureCommentsFileExists() {
  const dataDir = path.join(process.cwd(), "data")
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify([]), "utf-8")
  }
}

// 读取所有评论
function readComments() {
  ensureCommentsFileExists()
  
  try {
    const data = fs.readFileSync(COMMENTS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("读取评论失败:", error)
    return []
  }
}

// 写入评论
function writeComments(comments: any[]) {
  ensureCommentsFileExists()
  
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf-8")
    return true
  } catch (error) {
    console.error("写入评论失败:", error)
    return false
  }
}

// 获取环境变量，增加错误处理
function getEnvVariable(key: string, defaultValue: string = ""): string {
  const value = process.env[key]
  if (!value) {
    // 仅在生产环境记录警告
    if (process.env.NODE_ENV === "production") {
      console.warn(`警告: 环境变量 ${key} 未定义，使用默认值`)
    }
    return defaultValue
  }
  return value
}

// 验证Turnstile令牌
async function verifyTurnstileToken(token: string) {
  try {
    // 获取环境变量中的密钥
    const secretKey = getEnvVariable(
      "TURNSTILE_SECRET_KEY", 
      "1x0000000000000000000000000000000AA" // 开发环境默认测试密钥
    )
    
    const formData = new FormData()
    formData.append("secret", secretKey)
    formData.append("response", token)
    
    // 添加验证请求的IP地址 (在Vercel环境中有效)
    if (process.env.VERCEL) {
      const ip = getEnvVariable("VERCEL_IP")
      if (ip) formData.append("remoteip", ip)
    }
    
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    })
    
    const data = await response.json()
    
    // 详细的验证日志 (仅在非生产环境)
    if (process.env.NODE_ENV !== "production") {
      console.log("Turnstile验证结果:", data)
    }
    
    return data.success === true
  } catch (error) {
    console.error("验证Turnstile令牌失败:", error)
    return false
  }
}

// GET 处理程序 - 获取所有评论
export async function GET() {
  try {
    const comments = readComments()
    
    // 移除敏感信息（邮箱）
    const sanitizedComments = comments.map((comment: any) => {
      const { email, ...rest } = comment
      return rest
    })
    
    return NextResponse.json(sanitizedComments)
  } catch (error) {
    console.error("获取评论失败:", error)
    return NextResponse.json(
      { message: "获取评论失败" },
      { status: 500 }
    )
  }
}

// POST 处理程序 - 添加新评论
export async function POST(request: Request) {
  try {
    const { name, email, comment, token } = await request.json()
    
    // 验证必填字段
    if (!name || !email || !comment || !token) {
      return NextResponse.json(
        { message: "缺少必要的字段" },
        { status: 400 }
      )
    }
    
    // 验证Turnstile令牌
    const isValidToken = await verifyTurnstileToken(token)
    if (!isValidToken) {
      return NextResponse.json(
        { message: "人机验证失败，请重试" },
        { status: 400 }
      )
    }
    
    // 读取现有评论
    const comments = readComments()
    
    // 创建新评论
    const newComment = {
      id: uuidv4(),
      name,
      email,
      comment,
      createdAt: new Date().toISOString(),
    }
    
    // 添加到评论列表
    comments.unshift(newComment)
    
    // 写入到文件
    const success = writeComments(comments)
    if (!success) {
      throw new Error("保存评论失败")
    }
    
    // 返回成功响应（不包括邮箱）
    const { email: _, ...commentWithoutEmail } = newComment
    
    return NextResponse.json(commentWithoutEmail, { status: 201 })
  } catch (error) {
    console.error("添加评论失败:", error)
    return NextResponse.json(
      { message: "添加评论失败" },
      { status: 500 }
    )
  }
} 