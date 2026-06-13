import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/prism-portfolio/projects/flip',
  assetPrefix: '/prism-portfolio/projects/flip/',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
