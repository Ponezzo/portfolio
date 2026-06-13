import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/prism-portfolio/projects/dingading',
  assetPrefix: '/prism-portfolio/projects/dingading/',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
