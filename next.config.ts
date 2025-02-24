import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    i18n: {
        locales: ['zh-CN', 'en-US'],
        defaultLocale: 'zh-CN',
        localeDetection: false,
    },
    trailingSlash: true,
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
