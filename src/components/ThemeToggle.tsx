'use client'

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme, resolvedTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleToggle = () => {
        const currentTheme = resolvedTheme || theme
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        setTheme(newTheme)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleToggle()
        }
    }

    if (!mounted) return null

    return (
        <button
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="rounded-full p-2 transition-colors hover:bg-accent "
            aria-label="切换主题"
            role="switch"
            aria-checked={theme === "dark"}
            tabIndex={0}
        >
            {theme === "dark" ? (
                <Sun className="h-6 w-6" />
            ) : (
                <Moon className="h-6 w-6" />
            )}
        </button>
    )
}
