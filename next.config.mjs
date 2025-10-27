/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'jqchdbnpwsmvffdlzkdd.supabase.co' },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
