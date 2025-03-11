import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    trailingSlash: true,
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
