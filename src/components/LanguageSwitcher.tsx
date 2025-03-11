"use client";

import { useRouter, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

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
                <button
                    className="flex items-center rounded-full p-2 transition-colors hover:bg-accent"
                    aria-label="切换语言"
                    role="button"
                    tabIndex={0}
                >
                    <Globe className="h-6 w-6" />
                    <span className="ml-2">{currentLang.toUpperCase()}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange('zh')} aria-label="切换到中文">
                    中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} aria-label="Switch to English">
                    English
                </DropdownMenuItem>
                {/* 可以在这里添加更多语言选项 */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher; 