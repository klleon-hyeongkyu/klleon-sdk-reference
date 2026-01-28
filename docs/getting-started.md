---
sidebar_position: 2
---

# 빠른 시작

5분 만에 AI 아바타 채팅을 구현하는 방법을 안내합니다.

## 1단계: SDK 추가

HTML 파일에 스크립트 태그를 추가합니다.

```html
<script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
```

SDK를 로드하면 `window.KlleonChat` 전역 객체가 생성됩니다.

## 2단계: 아바타 컨테이너 추가

아바타 영상이 표시될 컨테이너를 HTML에 추가합니다.

```html
<avatar-container></avatar-container>
```

:::info
`<avatar-container>`는 SDK가 제공하는 웹 컴포넌트입니다. 별도의 import 없이 사용할 수 있습니다.
:::

## 3단계: 이벤트 구독

SDK 상태와 채팅 메시지를 수신하기 위해 이벤트를 구독합니다.

```javascript
const { onStatusEvent, onChatEvent, onErrorEvent } = KlleonChat;

// 상태 변경 이벤트
onStatusEvent((status) => {
  console.log('상태:', status);
});

// 채팅 메시지 이벤트
onChatEvent((data) => {
  console.log('채팅:', data.message);
});

// 에러 이벤트
onErrorEvent((error) => {
  console.error('에러:', error.code, error.message);
});
```

## 4단계: SDK 초기화

SDK를 초기화하여 아바타 서버에 연결합니다.

```javascript
const { init } = KlleonChat;

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

:::warning
`sdk_key`와 `avatar_id`는 Klleon 콘솔에서 발급받으세요.
:::

## 5단계: 메시지 전송

`VIDEO_CAN_PLAY` 상태가 되면 메시지를 전송할 수 있습니다.

```javascript
const { onStatusEvent, sendTextMessage } = KlleonChat;

onStatusEvent((status) => {
  if (status === 'VIDEO_CAN_PLAY') {
    // 아바타 준비 완료
    sendTextMessage('안녕하세요!');
  }
});
```

## 전체 코드 예제

### HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klleon Avatar Chat</title>
  <script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
  <style>
    avatar-container {
      width: 400px;
      height: 600px;
      display: block;
    }
    .chat-input {
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <avatar-container></avatar-container>

  <div class="chat-input">
    <input type="text" id="messageInput" placeholder="메시지를 입력하세요">
    <button id="sendBtn">전송</button>
  </div>

  <script>
    const { init, onStatusEvent, onChatEvent, onErrorEvent, sendTextMessage, destroy } = KlleonChat;

    let isReady = false;

    // 이벤트 구독
    onStatusEvent((status) => {
      console.log('상태:', status);
      if (status === 'VIDEO_CAN_PLAY') {
        isReady = true;
      }
    });

    onChatEvent((data) => {
      console.log(`[${data.chat_type}] ${data.message}`);
    });

    onErrorEvent((error) => {
      console.error('에러:', error.code, error.message);
    });

    // SDK 초기화
    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    // 메시지 전송
    document.getElementById('sendBtn').addEventListener('click', () => {
      if (!isReady) {
        alert('아바타가 아직 준비되지 않았습니다.');
        return;
      }
      const input = document.getElementById('messageInput');
      const message = input.value.trim();
      if (message) {
        sendTextMessage(message);
        input.value = '';
      }
    });

    // 페이지 종료 시 정리
    window.addEventListener('beforeunload', () => {
      destroy();
    });
  </script>
</body>
</html>
```

### React

먼저 `public/index.html`에 SDK 스크립트를 추가합니다:

```html
<script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
```

그 다음 컴포넌트에서 `window.KlleonChat`을 사용합니다:

```tsx
import { useEffect, useState, useRef } from 'react';

function AvatarChat() {
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const {
      init,
      destroy,
      onStatusEvent,
      onChatEvent,
      onErrorEvent,
      sendTextMessage,
    } = window.KlleonChat;

    onStatusEvent((status) => {
      console.log('상태:', status);
      if (status === 'VIDEO_CAN_PLAY') {
        setIsReady(true);
      }
    });

    onChatEvent((data) => {
      setMessages((prev) => [...prev, `[${data.chat_type}] ${data.message}`]);
    });

    onErrorEvent((error) => {
      console.error('에러:', error.code, error.message);
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    return () => {
      destroy();
    };
  }, []);

  const handleSend = () => {
    if (!isReady || !inputRef.current) return;
    const message = inputRef.current.value.trim();
    if (message) {
      window.KlleonChat.sendTextMessage(message);
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <avatar-container style={{ width: 400, height: 600 }} />

      <div>
        <input ref={inputRef} type="text" placeholder="메시지를 입력하세요" />
        <button onClick={handleSend} disabled={!isReady}>
          전송
        </button>
      </div>

      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default AvatarChat;
```

## 다음 단계

- [init()](/docs/api/init) - 초기화 옵션 상세 설명
- [이벤트](/docs/api/events) - 이벤트 타입과 데이터 구조
- [에러 처리](/docs/guides/error-handling) - 에러 코드와 대응 방법
