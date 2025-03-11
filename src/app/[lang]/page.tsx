import Image from "next/image";
import PostList from '@/components/PostList'
import ProjectList from '@/components/ProjectList'
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "首页",
  description: "Tandre的博客主页",
  openGraph: {
    title: "首页 | Tandre's Blog",
    description: "Tandre最新的博客、项目及联系方式",
  },
  alternates: {
    canonical: "/",
  },
};

function ContactItem({ label, link, text }: { label: string; link: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="w-20 justify-center text-gray-500 dark:text-gray-400">{label}</Badge>
      <Button
        asChild
        variant="link"
        className="text-primary text-red-500 hover:text-red-600 p-0 h-auto"
      >
        <Link href={link} target="_blank" rel="noopener">
          {text}
          {/* <ExternalLink className="ml-1 h-4 w-4" /> */}
        </Link>
      </Button>
    </div>
  );
}

export default async function Home({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionaries = await getDictionary(lang);
  return (
    <div className="mx-auto">
      {/* 引言区块 */}
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          <p>{dictionaries.home.alert}</p>
          <p className="text-right">{dictionaries.home.alert_author}</p>
        </AlertDescription>
      </Alert>

      {/* 个人介绍 - 使用shadcn Button组件 */}
      <Card className="my-4 hover:shadow-md">
        <CardHeader>
          <CardTitle>
            <Link href="/about" className="hover:underline text-red-500 hover:text-red-600">
              {dictionaries.home.about_me}
            </Link>
          </CardTitle>
          <CardDescription>
            {dictionaries.home.about_me_description}
          </CardDescription>
        </CardHeader>
      </Card>


      {/* 博客列表 */}
      <h2 className="my-4 text-2xl font-bold">
        {dictionaries.home.home_blog.title}
      </h2>
      <PostList className="my-4 text-sm" dictionary={dictionaries} />

      {/* 增加间隔 */}
      <div className="my-4" />
      {/* 项目列表 */}

      <h2 className="my-4 text-2xl font-bold">
        {dictionaries.home.projects}
      </h2>
      <ProjectList className="my-4 text-sm" lang={lang} />

      {/* 分割线 */}
      <Separator className="my-12" />

      {/* 联系信息 */}
      <Card className="my-4 hover:shadow-md">
        <CardHeader>
          <CardTitle>
            {dictionaries.home.contact}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 w-full md:w-1/2 pr-0 md:pr-8">
            <ContactItem
              label={dictionaries.contact.blog}
              link="https://tandrez.notion.site/Tandre-s-Blog-c377d7e1d63342408b0ed036e181a266"
              text="Tandre's Blog"
            />
            <ContactItem
              label="Github"
              link="https://github.com/Tandre-Z"
              text="Tandre-Z"
            />
            <ContactItem
              label="CSDN"
              link="https://blog.csdn.net/weixin_46050495?spm=1010.2135.3001.5343"
              text="Tandre_Z"
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-20 justify-center text-gray-500 dark:text-gray-400">{dictionaries.contact.wechat}</Badge>
              <p className="text-gray-500 dark:text-gray-400 p-0 h-auto">
                Tandre的游戏笔记
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 pl-0 md:pl-8 flex justify-start md:justify-end">
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/img/tandrewechat.jpg"
                className="rounded-lg border shadow hover:scale-105 transition-transform"
                alt="WeChat QR Code"
                width={140}
                height={140}
              />
              <p className="text-xs text-muted-foreground mt-2 md:hidden">{dictionaries.contact.wechat_description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 - 优化排版 */}
      <div className="mt-16 text-left text-sm text-gray-500 dark:text-gray-400 space-y-1 opacity-75 hover:opacity-100 transition-opacity">
        <p className="tracking-wide">{dictionaries.home.last_updated} 2024/12/27</p>
        <p className="font-mono text-primary dark:text-primary-dark">TandreZ</p>
      </div>
    </div>
  );
}


