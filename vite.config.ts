/*
 * @Author: lifenglei 1125911451@qq.com
 * @Date: 2025-12-26 22:11:15
 * @LastEditors: lifenglei 1125911451@qq.com
 * @LastEditTime: 2025-12-26 22:14:16
 * @FilePath: /fluentStep/vite.config.ts
 * @Description: 
 * 
 */
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
