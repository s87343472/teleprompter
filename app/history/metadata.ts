import { Metadata } from "next"
import { defaultMetadata } from "../metadata"

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "历史记录 | Teleprompter",
  description: "查看和管理您的提词脚本历史记录。轻松访问和重用之前的脚本内容。",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "历史记录 | Teleprompter",
    description: "查看和管理您的提词脚本历史记录。轻松访问和重用之前的脚本内容。",
    url: '/history',
    images: [
      {
        url: '/og-history.png',
        width: 1200,
        height: 630,
        alt: '历史记录',
      },
    ],
  },
} 