import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    basePath: '',
    trailingSlash: true,
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: false,
    },
};

export default nextConfig;
