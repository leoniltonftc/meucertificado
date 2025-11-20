import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do diretório atual
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Base '/' garante que funcione na raiz do domínio (Vercel/Netlify)
    base: '/',
    resolve: {
      alias: {
        "@": path.resolve('.'),
      },
    },
    define: {
      // Removed API_KEY injection as AI features are removed
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
});