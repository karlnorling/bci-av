// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://karlnorling.github.io',
  base: '/bci-av',
  integrations: [
    starlight({
      title: 'Blissymbolics',
      description:
        'The BCI Authorized Vocabulary of Blissymbolics as typed packages for React, Vue 3, Web Components, CSS and static SVG.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/karlnorling/bci-av' }],
      editLink: {
        baseUrl: 'https://github.com/karlnorling/bci-av/edit/main/apps/docs/',
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Introduction', slug: '' },
            { label: 'Getting started', slug: 'getting-started' },
            { label: 'Licensing', slug: 'licensing' },
          ],
        },
        {
          label: 'Packages',
          items: [
            { label: 'Core API', slug: 'packages/core' },
            { label: 'React', slug: 'packages/react' },
            { label: 'Vue 3', slug: 'packages/vue' },
            { label: 'Web Components', slug: 'packages/elements' },
            { label: 'CSS Sprite', slug: 'packages/css' },
            { label: 'SVG Sprite', slug: 'packages/sprite' },
            { label: 'Assets', slug: 'packages/assets' },
          ],
        },
        {
          label: 'Reference',
          items: [{ label: 'Symbol gallery', slug: 'gallery' }],
        },
      ],
    }),
  ],
});
