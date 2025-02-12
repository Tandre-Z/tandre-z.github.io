"use client"
import Image from 'next/image'
import { ThemeToggle } from "@/components/ThemeToggle"
import { useTheme } from "next-themes"
import { useEffect, useState } from 'react'

const Header = () => {
    const [mounted, setMounted] = useState(false)
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <header className="flex justify-between items-center max-w-[1200px]">
                <div className="w-[150px] h-[50px]" /> {/* 占位防止布局偏移 */}
                <ThemeToggle />
            </header>
        )
    }

    return (
        <header className="flex justify-between items-center max-w-[1200px]">
            <Image
                src={resolvedTheme === 'dark' ? "/img/logo-dark.png" : "/img/logo.png"}
                alt={resolvedTheme === 'dark' ? "暗色模式网站标志" : "网站Logo"}
                width={150}
                height={50}
                className="h-auto max-h-[150px] w-auto"
                priority
            />
            <ThemeToggle />
        </header>
    )
}

export default Header
