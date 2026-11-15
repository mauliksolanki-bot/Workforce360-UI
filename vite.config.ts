import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Pinned so the backend's CORS allow-list (app.cors-origins) stays valid -
        // without this, Vite silently picks the next free port (5174, 5175, ...)
        // whenever 5173 is already in use, which then gets blocked by CORS.
        port: 5173,
        strictPort: true,
    },
})
