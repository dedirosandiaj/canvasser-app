import { defineConfig } from "@solidjs/start/config";
import { config } from "dotenv";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

const result = config({ path: resolve(process.cwd(), '.env') });
if (result.error && (result.error as any).code !== 'ENOENT') {
     console.error('[app.config.ts] Dotenv error:', result.error);
} else {
    console.log('[app.config.ts] Environment check:', process.env.GOOGLE_SHEET_ID ? 'Variables Loaded' : 'No .env found (Using system env)');
}

export default defineConfig({
    server: {
        preset: "vercel"
    },
    vite: {
        plugins: [
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
                manifest: {
                    name: 'Canvasser App',
                    short_name: 'Canvasser',
                    description: 'App for recording store visits and canvassing data',
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
                }
            })
        ],
        server: {
            proxy: {
                '/api/v1/auth': {
                    target: 'https://localhost:8001',
                    changeOrigin: true,
                }
            }
        }
    }
});
