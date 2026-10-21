import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listens on 0.0.0.0 to expose to both local machine and local network (phones/tablets)
    port: 5173,
    strictPort: true
  },
  preview: {
    host: true,
    port: 5173
  }
})
