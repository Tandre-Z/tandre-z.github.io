"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, CheckCircle2, AlertTriangle } from "lucide-react";

type ConfigStatus = {
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceRole: boolean;
    urlPreview: string;
    missingVars: string[];
};

type Props = {
    lang: string;
    configStatus: ConfigStatus;
};

export default function DatabaseConfigClient({ lang, configStatus }: Props) {
    const isZh = lang === "zh";
    const [message, setMessage] = useState("");
    const [testing, setTesting] = useState(false);

    const testConnection = async () => {
        setTesting(true);
        setMessage("");

        try {
            const response = await fetch("/api/supabase-health", {
                method: "GET",
                cache: "no-store",
            });
            const data = await response.json().catch(() => ({ message: "Unknown error" }));

            if (response.ok && data.ok) {
                setMessage(isZh ? "连接测试成功：服务端已可访问 Supabase。" : "Connection test passed: server can access Supabase.");
            } else {
                setMessage(
                    isZh
                        ? `连接失败：${data.message || "服务端连接异常"}`
                        : `Connection failed: ${data.message || "server connection error"}`
                );
            }
        } catch (error) {
            setMessage(isZh ? `请求异常：${String(error)}` : `Request error: ${String(error)}`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="hover:shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {isZh ? "Supabase 环境配置（只读）" : "Supabase Environment Config (Read-only)"}
                    </CardTitle>
                    <CardDescription>
                        {isZh
                            ? "该页面直接读取服务器环境变量，不再要求手动输入，避免密钥在浏览器侧泄露。"
                            : "This page reads server env vars directly, no manual input needed to reduce browser-side leakage risk."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={configStatus.hasUrl ? "default" : "destructive"}>
                            NEXT_PUBLIC_SUPABASE_URL {configStatus.hasUrl ? "✓" : "✗"}
                        </Badge>
                        <Badge variant={configStatus.hasAnonKey ? "default" : "destructive"}>
                            NEXT_PUBLIC_SUPABASE_ANON_KEY {configStatus.hasAnonKey ? "✓" : "✗"}
                        </Badge>
                        <Badge variant={configStatus.hasServiceRole ? "default" : "destructive"}>
                            SUPABASE_SERVICE_ROLE_KEY {configStatus.hasServiceRole ? "✓" : "✗"}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {isZh
                            ? `当前项目地址：${configStatus.urlPreview || "未配置"}`
                            : `Current project URL: ${configStatus.urlPreview || "not configured"}`}
                    </p>

                    {configStatus.missingVars.length > 0 ? (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {isZh
                                    ? `缺少环境变量：${configStatus.missingVars.join(", ")}`
                                    : `Missing env vars: ${configStatus.missingVars.join(", ")}`}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" onClick={testConnection} disabled={testing || configStatus.missingVars.length > 0}>
                            {testing ? (isZh ? "测试中..." : "Testing...") : (isZh ? "服务端测试连接" : "Server-side Test Connection")}
                        </Button>
                    </div>

                    {message ? (
                        <Alert>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    ) : null}
                </CardContent>
            </Card>

            <Card className="hover:shadow-md">
                <CardHeader>
                    <CardTitle>{isZh ? "迁移目标表" : "Migration Target Tables"}</CardTitle>
                    <CardDescription>
                        {isZh
                            ? "建表 SQL 已放在 supabase/schema.sql，可直接在 Supabase SQL Editor 执行。"
                            : "Schema SQL is in supabase/schema.sql and can be executed in Supabase SQL Editor."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">blog_posts</Badge>
                        <Badge variant="outline">work_items</Badge>
                        <Badge variant="outline">site_meta</Badge>
                    </div>

                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>{isZh ? "执行顺序建议" : "Recommended Order"}</AlertTitle>
                        <AlertDescription>
                            {isZh
                                ? "先执行 schema.sql，再导入 JSON 数据。最后把前端读数据逻辑从本地 JSON 改为 Supabase 查询。"
                                : "Run schema.sql first, import JSON data, then switch frontend data loading from local JSON to Supabase queries."}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
