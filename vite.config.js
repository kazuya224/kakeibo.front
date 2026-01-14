import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // フロントエンドからの '/transaction' への POST をバックエンドへ転送
      '/transaction': {
        target: 'http://localhost:8080', // Java側のポートを確認してください
        changeOrigin: true,
        secure: false,
      },
      // ログイン・新規登録のリクエストも同様に転送
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})