import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载 .env 文件，根据当前模式（development/production）
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    server: {
      // 示例：使用 .env 中的 API_BASE_URL 配置代理
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // 其他配置...
    define: {
      // 如果需要将自定义变量注入到客户端（可选）
      'process.env.SOME_VAR': JSON.stringify(env.SOME_VAR),
    },
  };
});