/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Next dev assets when accessing through a tunnel URL.
  // (Quick tunnels change hostname often, so we allow the whole trycloudflare domain.)
  allowedDevOrigins: ["https://*.trycloudflare.com", "https://trycloudflare.com"],
};

export default nextConfig;
