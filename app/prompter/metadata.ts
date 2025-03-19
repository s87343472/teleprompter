import { Metadata } from "next"

export const metadata: Metadata = {
  title: "提词器编辑器 | Teleprompter Today",
  description: "Teleprompter Today 提供专业的提词器编辑器，支持实时预览、速度调节、镜像显示等功能。为您的演讲和直播提供完美的提词体验。",
  openGraph: {
    title: "提词器编辑器 | Teleprompter Today",
    description: "Teleprompter Today 提供专业的提词器编辑器，支持实时预览、速度调节、镜像显示等功能。为您的演讲和直播提供完美的提词体验。",
    url: '/prompter',
    images: [
      {
        url: '/og-prompter.png',
        width: 1200,
        height: 630,
        alt: 'Teleprompter Today 提词器编辑器',
      },
    ],
  },
} 