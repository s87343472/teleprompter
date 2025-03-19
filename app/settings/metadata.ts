import { Metadata } from "next"
import { defaultMetadata } from "../metadata"

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "设置 | Teleprompter",
  description: "自定义您的提词器体验。调整主题、语言、默认字体大小和滚动速度等设置。",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "设置 | Teleprompter",
    description: "自定义您的提词器体验。调整主题、语言、默认字体大小和滚动速度等设置。",
    url: '/settings',
    images: [
      {
        url: '/og-settings.png',
        width: 1200,
        height: 630,
        alt: '设置',
      },
    ],
  },
} 