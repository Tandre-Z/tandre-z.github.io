import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBasePath = (path: string) => {
  // 确保路径以/开头
  const safePath = path.startsWith('/') ? path : `/${path}`
  return safePath
}
