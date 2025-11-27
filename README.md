# Miyazaki Style Blog

一个使用 Vue 3 + Vite + Element Plus + Tailwind CSS 构建的个人技术博客。

## ✨ 特性

- **宫崎骏风格**: 简洁、清新、美观的 UI 设计
- **响应式布局**: 完美适配桌面端和移动端
- **现代化字体**: Inter + Source Serif 4 + JetBrains Mono 字体组合
- **丰富的交互**: 打字机效果、平滑动画、苹果风格过渡
- **Markdown 渲染**: 支持完整 Markdown 语法，代码高亮
- **后台管理**: 文章、分类、标签、评论、用户管理

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite (Rolldown) |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 组件 | Element Plus |
| 样式 | Tailwind CSS 4 |
| Markdown | marked |

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd Blog

# 安装依赖
npm install
```

## 🚀 开发

```bash
# 启动开发服务器
npm run dev

# 默认访问 http://localhost:5173
```

## 📋 构建部署

### 1. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 2. 本地预览

```bash
npm run preview
```

### 3. 部署到服务器

#### 方式一：Nginx 部署

1. 将 `dist/` 目录内容上传到服务器

2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/blog/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 字体文件
    location /fonts/ {
        expires 1y;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin *;
    }

    # Vue Router History 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如果后端在同一服务器）
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. 重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 方式二：Docker 部署

1. 创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建并运行：

```bash
docker build -t miyazaki-blog .
docker run -d -p 80:80 miyazaki-blog
```

#### 方式三：静态托管平台

支持部署到以下平台：

- **Vercel**: 连接 Git 仓库，自动部署
- **Netlify**: 拖拽 `dist/` 文件夹或连接 Git
- **GitHub Pages**: 使用 GitHub Actions 自动部署
- **Cloudflare Pages**: 连接 Git 仓库

### 4. 环境变量配置

创建 `.env.production` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=https://api.your-domain.com

# 其他配置...
```

## 📁 项目结构

```
Blog/
├── public/              # 静态资源
│   └── fonts/           # 字体文件
├── src/
│   ├── api/             # API 请求
│   ├── assets/          # 项目资源
│   ├── components/      # 公共组件
│   │   ├── NavBar.vue
│   │   ├── Footer.vue
│   │   ├── ArticleCard.vue
│   │   └── ...
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── views/           # 页面视图
│   │   ├── Home.vue
│   │   ├── ArticleDetail.vue
│   │   └── admin/       # 后台管理页面
│   ├── App.vue
│   ├── main.ts
│   └── style.css        # 全局样式
├── backend/             # 后端代码 (FastAPI)
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔗 相关文档

- [API 文档](./API_DOCS.md) - 后端接口规范
- [后端部署](./backend/README.md) - FastAPI 后端部署指南

## 📄 License

MIT License
