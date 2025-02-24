import type { Metadata } from "next";
import Header from '@/components/Header'
import Footer from "@/components/Footer";
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";


export const metadata: Metadata = {
  title: {
    default: "Tandre's Blog",
    template: "%s | Tandre的博客"
  },
  description: "Tandre的个人博客",
  keywords: ["游戏开发", "Unity", "虚拟仿真", "游戏设计", "编程技术", "存在主义"],
  openGraph: {
    title: "Tandre's Blog",
    description: "Tandre的个人博客，分享Unity开发、游戏设计理论与编程实践等",
    url: "https://tandre.cn",
    siteName: "Tandre's Blog",
    images: [
      {
        url: "/img/icon.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tandre's Blog",
    description: "Tandre的个人博客",
    images: ["/img/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="baidu-site-verification" content="codeva-GtnA5uOKWx" />
        <style>{`
          :root {
            --color-primary: 59 130 246;
            --color-primary-dark: 99 102 241;
          }
          @font-face {
            font-family: 'HarmonyOS';
            src: url('/fonts/HarmonyOS_Sans_SC_Medium.ttf');
          }
        `}</style>
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          {...({} as React.ComponentProps<typeof ThemeProvider>)}
        >
          <div className="flex justify-center">
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
              <header>
                <Header />
              </header>
              {children}
              <footer className="mt-12 w-full text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <Footer />
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}