# Miyazaki Style Blog

[中文（默认）](./README.md) | [English](./README.en.md)

A personal tech blog built with Vue 3 + Vite + Element Plus + Tailwind CSS.

## Features

- Miyazaki-inspired clean UI
- Responsive layout for desktop and mobile
- Markdown rendering with code highlighting
- Admin panel for articles, categories, tags, comments, and users

## Tech Stack

| Category | Tech |
| --- | --- |
| Framework | Vue 3 + TypeScript |
| Build | Vite |
| State | Pinia |
| Router | Vue Router 4 |
| UI | Element Plus |
| Styles | Tailwind CSS |
| Markdown | marked |

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Default: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Deploy

You can deploy with:

1. Nginx static hosting
2. Docker (build image with `dist/`)
3. Static platforms such as Vercel / Netlify / GitHub Pages / Cloudflare Pages

## Environment

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

## Docs

- [API Docs (中文)](./API_DOCS.md)
- [API Docs (English)](./API_DOCS.en.md)
- [Backend Repo](https://github.com/natsume37/Blog-backend)

## License

MIT
