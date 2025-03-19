import { Metadata } from "next"

export const defaultMetadata: Metadata = {
  metadataBase: new URL('https://teleprompter.today'),
  title: {
    default: "Teleprompter Today | 专业提词器",
    template: "%s | Teleprompter Today"
  },
  description: "Teleprompter Today 是一款专业的网页提词器，为内容创作者、主播和演讲者打造。支持中英双语、镜像显示、速度调节等功能，让您的演讲更加流畅自然。",
  keywords: ["Teleprompter Today", "提词器", "teleprompter", "演讲", "直播", "内容创作", "主播", "双语"],
  authors: [{ name: "Teleprompter Today Team" }],
  creator: "Teleprompter Today Team",
  publisher: "Teleprompter Today",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    siteName: "Teleprompter Today",
  },
  twitter: {
    card: "summary_large_image",
    site: "@telepromptertoday",
    creator: "@telepromptertoday",
  },
  verification: {
    google: "google-site-verification-code",
    other: {
      "yandex-verification": "yandex-verification-code",
      "baidu-site-verification": "baidu-site-verification-code",
    },
  },
} 