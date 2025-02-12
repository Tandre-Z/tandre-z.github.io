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

export default function Home() {
  return (
    <div className="mx-auto">
      {/* 引言区块 */}
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          &quot;在信息时代，客观障碍已不复存在，&quot;他说：&quot;所谓障碍都是主观上的。如果你想动手开发什么全新的技术，你不需要几百万美元的资金，你只需要在冰箱里放满比萨和可乐，再有一台便宜的计算机，和为之献身的决心。我们在地板上睡过，我们从河水中趟过。&quot;<br />
          <br />
          ——[美] 大卫·卡什诺《DOOM启示录》
        </AlertDescription>
      </Alert>

      {/* 个人介绍 - 使用shadcn Button组件 */}
      <Card className="my-4 hover:shadow-md">
        <CardHeader>
          <CardTitle>
            <Link href="/about" className="hover:underline text-red-500 hover:text-red-600">
              关于我 About
            </Link>
          </CardTitle>
          <CardDescription>
            我是Tandre，一个有点理想主义，时而内卷时而躺平的游戏开发爱好者，目前在一家上市公司做虚拟仿真、数字孪生相关的unity开发工作。通过该博客记录个人关于游戏创作、技术成长及对生活的思考。
          </CardDescription>
        </CardHeader>
      </Card>


      {/* 博客列表 */}
      <h2 className="my-4 text-2xl font-bold">
        博客 Blog
      </h2>
      <PostList className="my-4 text-sm" />

      {/* 增加间隔 */}
      <div className="my-4" />
      {/* 项目列表 */}

      <h2 className="my-4 text-2xl font-bold">
        项目 Project
      </h2>
      <ProjectList className="my-4 text-sm" />

      {/* 分割线 */}
      <Separator className="my-12" />

      {/* 联系信息 */}
      <Card className="my-4 hover:shadow-md">
        <CardHeader>
          <CardTitle>
            联系 Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 w-full md:w-1/2 pr-0 md:pr-8">
            <ContactItem
              label="我的博客"
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
              <Badge variant="outline" className="w-20 justify-center text-gray-500 dark:text-gray-400">公众号</Badge>
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
              <p className="text-xs text-muted-foreground mt-2 md:hidden">微信扫码订阅</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 - 优化排版 */}
      <div className="mt-16 text-left text-sm text-gray-500 dark:text-gray-400 space-y-1 opacity-75 hover:opacity-100 transition-opacity">
        <p className="tracking-wide">更新于2024/12/27</p>
        <p className="font-mono text-primary dark:text-primary-dark">TandreZ</p>
      </div>
    </div>
  );
}


