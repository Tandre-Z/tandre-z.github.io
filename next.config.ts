import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    trailingSlash: true,
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
