"use client";

import { useRouter, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = ({ currentLang }: { currentLang: string }) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (locale: string) => {
        // 获取当前路径并替换语言部分
        const currentPath = pathname || "";
        const newPath = currentPath.replace(`/${currentLang}`, `/${locale}`);

        // 如果路径没有变化（可能是首页），则直接跳转到新语言的首页
        if (newPath === currentPath) {
            router.push(`/${locale}`);
        } else {
            router.push(newPath);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-label="切换语言">
                    {currentLang === 'zh' ? '中文' : 'English'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange('zh')} aria-label="切换到中文">
                    中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} aria-label="Switch to English">
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher; 