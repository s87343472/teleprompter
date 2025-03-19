import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Teleprompter Today | 专业提词器",
  description: "Teleprompter Today 是一款专业的网页提词器，为内容创作者、主播和演讲者打造。支持中英双语、镜像显示、速度调节等功能，让您的演讲更加流畅自然。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    siteName: "Teleprompter Today",
    title: "Teleprompter Today | 专业提词器",
    description: "Teleprompter Today 是一款专业的网页提词器，为内容创作者、主播和演讲者打造。支持中英双语、镜像显示、速度调节等功能，让您的演讲更加流畅自然。",
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Teleprompter Today - 专业提词器',
      },
    ],
  },
} 