import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // "@/..." = src/... (the shadcn/ui convention, so registry components drop in as they are)
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})