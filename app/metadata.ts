import type { Metadata } from "next"

export const defaultMetadata: Partial<Metadata> = {
  title: "Teleprompter Today - 专业的网页提词器应用 | 在线直播、演讲、主持提词工具",
  description: "Teleprompter Today 是一款专业的在线提词器应用，支持中英双语、镜像显示、手势控制、速度调节等功能。适用于直播、演讲、主持、教学等场景，让您的表现更加专业自然。",
  applicationName: "Teleprompter Today",
  authors: [{ name: "Teleprompter Today Team", url: "https://teleprompter.today" }],
  keywords: ["teleprompter", "提词器", "演讲", "直播", "主持", "镜像显示", "手势控制", "速度调节", "在线提词器", "专业提词器"],
  creator: "Teleprompter Today Team",
  publisher: "Teleprompter Today",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Teleprompter Today - 专业的网页提词器应用",
    description: "专业的在线提词器应用，支持中英双语、镜像显示、手势控制、速度调节等功能。适用于直播、演讲、主持、教学等场景。",
    url: "https://teleprompter.today",
    siteName: "Teleprompter Today",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // 需要替换为实际的验证码
  },
  category: "technology",
} 