import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const defaultAllowed = [
    "localhost",
    "127.0.0.1",
].filter(Boolean);

const extraAllowed = (process.env.VITE_ALLOWED_HOSTS ?? "code-server.synawave.ai")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

const allowedHosts = Array.from(new Set([...defaultAllowed, ...extraAllowed]));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { 
      '@': path.resolve(__dirname, './src') 
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5174,
    allowedHosts: [...allowedHosts],
    strictPort: true,
  },
})
