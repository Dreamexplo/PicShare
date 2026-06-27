/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@supabase/supabase-js"],
  },
};

module.exports = nextConfig;
