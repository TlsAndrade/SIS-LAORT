/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de ESLint durante `next build` (produção)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Caso adicione configurações extras (p.ex. experimental, images),
  // basta incluí-las aqui dentro deste objeto.
};

module.exports = nextConfig;
