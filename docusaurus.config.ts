import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Klleon Chat SDK',
  tagline: 'AI 아바타와 실시간 대화를 구현하는 JavaScript SDK',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://klleon.io',
  baseUrl: '/',

  organizationName: 'klleon',
  projectName: 'klleon-sdk-reference',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/klleon-social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Klleon Chat SDK',
      logo: {
        alt: 'Klleon Logo',
        src: 'img/klleon_logo_full.png',
        height: 24,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '문서',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '문서',
          items: [
            {
              label: '빠른 시작',
              to: '/docs/getting-started',
            },
            {
              label: 'API 레퍼런스',
              to: '/docs/api/init',
            },
          ],
        },
        {
          title: '리소스',
          items: [
            {
              label: 'Klleon',
              href: 'https://klleon.io',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Klleon Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
