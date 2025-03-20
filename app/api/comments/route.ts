import { NextResponse } from "next/server"

/**
 * 评论功能暂时禁用
 * 
 * 注意：评论功能已暂时禁用，计划在未来用户量增加后迁移到专门的服务器处理。
 * 当前的文件系统存储方案不适用于无服务器环境如Vercel部署。
 * 
 * 未来计划：
 * 1. 部署专门的服务器处理评论存储和检索
 * 2. 增加更多的反垃圾评论措施
 * 3. 可能添加用户账户系统
 */

// GET 处理程序 - 获取预设评论
export async function GET() {
  try {
    // 返回示例评论数据
    return NextResponse.json(require('../../../data/comments.json'))
  } catch (error) {
    console.error("获取评论失败:", error)
    return NextResponse.json(
      { message: "获取评论失败" },
      { status: 500 }
    )
  }
}

// POST 处理程序 - 禁用添加新评论
export async function POST() {
  return NextResponse.json(
    { 
      message: "评论功能暂时禁用。我们计划在未来用户量增加时迁移到专门的服务器。请谅解！" 
    },
    { status: 503 }
  )
} 