import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ConfigPasswordGate from "@/components/ConfigPasswordGate";
import ContentCrudManager from "@/components/ContentCrudManager";

export const metadata: Metadata = {
    title: "数据库配置",
    description: "Supabase 数据库配置与迁移准备页面",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function ConfigGggPage({
    params: { lang },
}: {
    params: { lang: string };
}) {
    const isZh = lang === "zh";
    const cookieStore = await cookies();
    const authed = cookieStore.get("config_page_auth")?.value === "granted";

    if (!authed) {
        return (
            <div className="mx-auto">
                <div className="my-4">
                    <Link href={`/${lang}`} className="text-red-500 hover:text-red-600 hover:underline">
                        <strong>{isZh ? "← 返回首页" : "← Back to Home"}</strong>
                    </Link>
                </div>
                <h1 className="text-2xl my-8 font-bold text-center">
                    {isZh ? "数据库配置（受保护）" : "Database Config (Protected)"}
                </h1>
                <ConfigPasswordGate lang={lang} />
            </div>
        );
    }

    return (
        <div className="mx-auto">
            <div className="my-4">
                <Link href={`/${lang}`} className="text-red-500 hover:text-red-600 hover:underline">
                    <strong>{isZh ? "← 返回首页" : "← Back to Home"}</strong>
                </Link>
            </div>

            <h1 className="text-2xl my-8 font-bold text-center">
                {isZh ? "内容后台管理" : "Content Admin Panel"}
            </h1>
            <ContentCrudManager lang={lang} />
        </div>
    );
}
