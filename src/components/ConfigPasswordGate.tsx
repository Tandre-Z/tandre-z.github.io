"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

type Props = {
    lang: string;
};

export default function ConfigPasswordGate({ lang }: Props) {
    const isZh = lang === "zh";
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/config-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Auth failed." }));
                setMessage(
                    isZh
                        ? `验证失败：${data.message || "密码错误或服务异常"}`
                        : `Verification failed: ${data.message || "wrong password or server error"}`
                );
                return;
            }

            window.location.reload();
        } catch (error) {
            setMessage(isZh ? `请求异常：${String(error)}` : `Request error: ${String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="my-6 hover:shadow-md max-w-xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {isZh ? "受保护页面" : "Protected Page"}
                </CardTitle>
                <CardDescription>
                    {isZh
                        ? "该页面仅限管理员访问，请输入访问密码。"
                        : "This page is restricted. Enter access password."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-3" onSubmit={onSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder={isZh ? "请输入密码" : "Enter password"}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? (isZh ? "验证中..." : "Verifying...") : (isZh ? "进入配置页面" : "Enter Config Page")}
                    </Button>
                </form>

                {message ? (
                    <Alert className="mt-3">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                ) : null}
            </CardContent>
        </Card>
    );
}
