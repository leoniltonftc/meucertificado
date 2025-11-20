import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do diretório atual
  // Substituído process.cwd() por '.' para evitar erro de tipagem em ambientes onde Process não tem cwd
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Base '/' garante que funcione na raiz do domínio (Vercel/Netlify)
    // Se for usar GitHub Pages em subdiretório (ex: user.github.io/repo), altere para '/nome-do-repo/'
    base: '/',
    resolve: {
      alias: {
        // Substituído __dirname por path.resolve('.') para compatibilidade com ESM e evitar erro de TS
        "@": path.resolve('.'),
      },
    },
    define: {
      // Garante que a API Key esteja disponível no código client-side
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});