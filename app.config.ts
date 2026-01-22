import { defineConfig } from "@solidjs/start/config";
import { config } from "dotenv";
import { resolve } from "path";

const result = config({ path: resolve(process.cwd(), '.env') });
if (result.error && (result.error as any).code !== 'ENOENT') {
     console.error('[app.config.ts] Dotenv error:', result.error);
} else {
    console.log('[app.config.ts] Environment check:', process.env.GOOGLE_SHEET_ID ? 'Variables Loaded' : 'No .env found (Using system env)');
}

export default defineConfig({
    server: {
        preset: "node-server"
    },
    vite: {
        server: {
            proxy: {
                '/api/v1/auth': {
                    target: 'http://localhost:8001',
                    changeOrigin: true,
                }
            }
        }
    }
});
