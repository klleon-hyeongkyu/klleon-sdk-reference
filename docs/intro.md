---
sidebar_position: 1
slug: /intro
---

# Klleon Chat SDK

AI 아바타와 실시간 대화를 구현하는 JavaScript SDK입니다.

## 주요 기능

- **실시간 아바타 대화**: WebSocket과 Agora RTC를 통한 실시간 음성/영상 스트리밍
- **텍스트 메시징**: 텍스트 기반 대화 지원
- **음성 인식(STT)**: 마이크를 통한 음성 입력 지원
- **다국어 지원**: 한국어, 영어, 일본어, 인도네시아어 지원
- **웹 컴포넌트**: 쉬운 통합을 위한 `<avatar-container>`, `<chat-container>` 제공

## 시스템 요구사항

- 최신 버전의 Chrome, Firefox, Safari, Edge 브라우저
- HTTPS 환경 (마이크 사용 시 필수)

## 설치

```html
<script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
```

SDK를 로드하면 `window.KlleonChat` 전역 객체를 통해 모든 메서드에 접근할 수 있습니다.

## 기본 사용법

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
</head>
<body>
  <avatar-container></avatar-container>

  <script>
    const { init, onStatusEvent, sendTextMessage } = KlleonChat;

    // 상태 이벤트 구독
    onStatusEvent((status) => {
      console.log('Status:', status);

      if (status === 'VIDEO_CAN_PLAY') {
        // 아바타 준비 완료, 메시지 전송 가능
        sendTextMessage('안녕하세요!');
      }
    });

    // SDK 초기화
    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });
  </script>
</body>
</html>
```

### React

```tsx
import { useEffect } from 'react';

// window.KlleonChat 타입 선언
declare global {
  interface Window {
    KlleonChat: typeof import('./types/klleon-chat');
  }
}

function AvatarChat() {
  useEffect(() => {
    const { init, onStatusEvent, sendTextMessage, destroy } = window.KlleonChat;

    onStatusEvent((status) => {
      if (status === 'VIDEO_CAN_PLAY') {
        sendTextMessage('안녕하세요!');
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    return () => {
      destroy();
    };
  }, []);

  return <avatar-container />;
}
```

:::info React에서 SDK 로드
React 프로젝트에서는 `index.html`에 스크립트 태그를 추가하거나, 동적으로 스크립트를 로드해야 합니다.
:::

## 상태 흐름

SDK는 초기화 과정에서 다음 상태를 순서대로 거칩니다:

```
IDLE → CONNECTING → SOCKET_CONNECTED → STREAMING_CONNECTED → CONNECTED_FINISH → VIDEO_LOAD → VIDEO_CAN_PLAY
```

:::tip
`VIDEO_CAN_PLAY` 상태가 되어야 `sendTextMessage()`, `startStt()` 등의 메서드를 사용할 수 있습니다.
:::

## 다음 단계

- [빠른 시작](/docs/getting-started) - 단계별 통합 가이드
- [init()](/docs/api/init) - 초기화 옵션 상세 설명
- [이벤트](/docs/api/events) - 이벤트 구독 방법
