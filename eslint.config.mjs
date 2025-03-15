/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desativar a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig