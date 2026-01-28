import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/init',
        'api/lifecycle',
        'api/messaging',
        'api/stt',
        'api/audio-echo',
        'api/avatar-control',
        'api/events',
      ],
    },
    {
      type: 'category',
      label: 'UI 컴포넌트',
      items: [
        'components/avatar-container',
        'components/chat-container',
      ],
    },
    {
      type: 'category',
      label: '가이드',
      items: [
        'guides/typescript',
        'guides/error-handling',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
