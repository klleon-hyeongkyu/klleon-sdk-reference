---
sidebar_position: 2
---

# chat-container

채팅 UI를 표시하는 웹 컴포넌트입니다.

## 기본 사용법

```html
<chat-container></chat-container>
```

SDK를 로드하면 `<chat-container>` 커스텀 엘리먼트가 자동으로 등록됩니다.

## 설명

`<chat-container>`는 아바타와의 대화 내용을 표시하는 채팅 UI 컴포넌트입니다. SDK 내부의 `messageList` 상태와 자동으로 동기화되어 메시지를 표시합니다.

## 속성

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `delay` | `number` | `30` | 타이핑 애니메이션 딜레이 (ms) |
| `type` | `"text"` \| `"voice"` | `"text"` | 입력 모드 (텍스트/음성) |
| `isShowCount` | `boolean` | `true` | 글자 수 표시 여부 |

### 사용 예시

```html
<!-- 기본 사용 -->
<chat-container></chat-container>

<!-- 옵션 설정 -->
<chat-container delay="50" type="voice" isShowCount="false"></chat-container>
```

## 스타일링

`<chat-container>`는 블록 레벨 요소로 동작하며, CSS로 크기와 스타일을 지정할 수 있습니다.

### 기본 스타일

```css
chat-container {
  display: block;
  width: 400px;
  height: 300px;
  overflow-y: auto;
}
```

### 커스텀 스타일

```css
chat-container {
  display: block;
  width: 100%;
  max-width: 500px;
  height: 400px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
}
```

## 전체 예제

### HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Container Example</title>
  <script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
  <style>
    .chat-wrapper {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      gap: 16px;
    }

    avatar-container {
      display: block;
      width: 300px;
      height: 450px;
      background-color: #1a1a2e;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .chat-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    chat-container {
      display: block;
      flex: 1;
      overflow-y: auto;
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    .input-row input {
      flex: 1;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .input-row button {
      padding: 12px 24px;
      background-color: #4a6cf7;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .input-row button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="chat-wrapper">
    <avatar-container></avatar-container>

    <div class="chat-panel">
      <chat-container></chat-container>

      <div class="input-row">
        <input type="text" id="messageInput" placeholder="메시지를 입력하세요">
        <button id="sendBtn" disabled>전송</button>
      </div>
    </div>
  </div>

  <script>
    const { init, onStatusEvent, sendTextMessage } = KlleonChat;

    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');

    let isReady = false;

    onStatusEvent((status) => {
      if (status === 'VIDEO_CAN_PLAY') {
        isReady = true;
        sendBtn.disabled = false;
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    sendBtn.addEventListener('click', () => {
      if (!isReady) return;
      const message = messageInput.value.trim();
      if (message) {
        sendTextMessage(message);
        messageInput.value = '';
      }
    });

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
  </script>
</body>
</html>
```

### React

```tsx
import { useEffect, useState, useRef } from 'react';

function ChatPage() {
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { init, destroy, onStatusEvent } = window.KlleonChat;

    onStatusEvent((status) => {
      if (status === 'VIDEO_CAN_PLAY') {
        setIsReady(true);
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    return () => destroy();
  }, []);

  const handleSend = () => {
    if (!isReady || !message.trim()) return;
    window.KlleonChat.sendTextMessage(message);
    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-wrapper">
      <avatar-container
        style={{
          display: 'block',
          width: 300,
          height: 450,
          backgroundColor: '#1a1a2e',
          borderRadius: 12,
        }}
      />

      <div className="chat-panel">
        <chat-container
          style={{
            display: 'block',
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        />

        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요"
          />
          <button onClick={handleSend} disabled={!isReady}>
            전송
          </button>
          <button onClick={() => window.KlleonChat.clearMessageList()}>
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
```

## 커스텀 채팅 UI

`<chat-container>` 대신 직접 채팅 UI를 구현할 수 있습니다. `onChatEvent()`로 메시지를 수신하여 원하는 형태로 렌더링하세요.

```tsx
import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  type: string;
  content: string;
  isAvatar: boolean;
}

function CustomChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const { onChatEvent } = window.KlleonChat;

    onChatEvent((data) => {
      // TEXT: 아바타 응답, STT_RESULT: 사용자 음성 인식 결과
      if (data.chat_type === 'TEXT' || data.chat_type === 'STT_RESULT') {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            type: data.chat_type,
            content: data.message,
            isAvatar: data.chat_type === 'TEXT',
          },
        ]);
      }
    });
  }, []);

  return (
    <div className="custom-chat">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={msg.isAvatar ? 'avatar-bubble' : 'user-bubble'}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
```

## TypeScript 타입

```typescript
// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'chat-container': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
```

## 관련 항목

- [avatar-container](/docs/components/avatar-container) - 아바타 비디오 컴포넌트
- [onChatEvent()](/docs/api/events#onchatevent) - 채팅 이벤트 구독
- [sendTextMessage()](/docs/api/messaging#sendtextmessage) - 메시지 전송
- [clearMessageList()](/docs/api/messaging#clearmessagelist) - 메시지 목록 초기화
