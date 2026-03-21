// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://bentopdf.sh',
  integrations: [
    starlight({
      title: 'bentopdf.sh',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/lokkju/bentopdf-sh' },
        { icon: 'external', label: 'npm', href: 'https://www.npmjs.com/package/bentopdf-sh' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [{ label: 'Getting Started', slug: 'docs/getting-started' }],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Reference', slug: 'docs/cli-reference' },
            { label: 'Supported Formats', slug: 'docs/supported-formats' },
          ],
        },
        {
          label: 'Integrations',
          items: [{ label: 'Claude Code', slug: 'docs/claude-code' }],
        },
        {
          label: 'Guides',
          items: [{ label: 'Troubleshooting', slug: 'docs/troubleshooting' }],
        },
      ],
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://bentopdf.sh/og.png' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://bentopdf.sh/og.png' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap' } },
      ],
    }),
  ],
  redirects: {
    '/docs/': '/docs/getting-started/',
  },
});
