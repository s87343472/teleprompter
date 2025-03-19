import { defaultMetadata } from "./metadata"
import { Metadata } from "next"

export const homeMetadata: Metadata = {
  ...defaultMetadata,
  title: defaultMetadata.title.default,
  openGraph: {
    ...defaultMetadata.openGraph,
    title: defaultMetadata.title.default,
    description: defaultMetadata.description,
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '专业提词器',
      },
    ],
  },
}

export const prompterMetadata: Metadata = {
  ...defaultMetadata,
  title: "提词器编辑器",
  description: "专业的提词器编辑器，支持实时预览、速度调节、镜像显示等功能。为您的演讲和直播提供完美的提词体验。",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "提词器编辑器 | Teleprompter",
    description: "专业的提词器编辑器，支持实时预览、速度调节、镜像显示等功能。为您的演讲和直播提供完美的提词体验。",
    url: '/prompter',
    images: [
      {
        url: '/og-prompter.png',
        width: 1200,
        height: 630,
        alt: '提词器编辑器',
      },
    ],
  },
}

export const historyMetadata: Metadata = {
  ...defaultMetadata,
  title: "历史记录",
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

export const settingsMetadata: Metadata = {
  ...defaultMetadata,
  title: "设置",
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