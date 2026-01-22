import { defineConfig } from "@solidjs/start/config";
import { config } from "dotenv";
import { resolve } from "path";

const result = config({ path: resolve(process.cwd(), '.env') });
console.log('[app.config.ts] Dotenv loaded. CWD:', process.cwd());
console.log('[app.config.ts] GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? 'Found' : 'NOT FOUND');
if (result.error) {
    console.error('[app.config.ts] Dotenv error:', result.error);
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
