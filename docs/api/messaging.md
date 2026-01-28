---
sidebar_position: 3
---

# Messaging

텍스트 메시지 전송과 관련된 메서드입니다.

## sendTextMessage()

사용자 텍스트 메시지를 아바타에게 전송합니다.

### 시그니처

```typescript
sendTextMessage(message: string): void
```

### 매개변수

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `message` | `string` | 전송할 텍스트 메시지 |

### 사용법

```javascript
const { sendTextMessage } = KlleonChat;

sendTextMessage('안녕하세요!');
```

### 주의사항

:::warning VIDEO_CAN_PLAY 상태 확인
`sendTextMessage()`는 `VIDEO_CAN_PLAY` 상태에서만 정상 동작합니다.
:::

### 예제: 입력 폼과 함께 사용

```javascript
const { sendTextMessage, onStatusEvent } = KlleonChat;

let isReady = false;

onStatusEvent((status) => {
  if (status === 'VIDEO_CAN_PLAY') {
    isReady = true;
  }
});

function handleSubmit(e) {
  e.preventDefault();
  if (!isReady) {
    alert('아바타가 준비되지 않았습니다.');
    return;
  }

  const input = document.getElementById('messageInput');
  const message = input.value.trim();

  if (message) {
    sendTextMessage(message);
    input.value = '';
  }
}
```

---

## echo()

아바타가 지정된 텍스트를 그대로 발화합니다. AI 응답 없이 텍스트를 읽어줍니다.

### 시그니처

```typescript
echo(message: string): void
```

### 매개변수

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `message` | `string` | 아바타가 발화할 텍스트 |

### 사용법

```javascript
const { echo } = KlleonChat;

// 아바타가 직접 발화
echo('환영합니다! 무엇을 도와드릴까요?');
```

### sendTextMessage와의 차이

| 메서드 | 동작 |
|--------|------|
| `sendTextMessage()` | 메시지를 AI에게 전송하고, AI가 응답을 생성하여 발화 |
| `echo()` | AI 처리 없이 전달된 텍스트를 그대로 아바타가 발화 |

### 사용 예시

- 공지사항이나 안내 메시지 전달
- 미리 정의된 스크립트 발화
- TTS 테스트

---

## clearMessageList()

내부 메시지 목록을 초기화합니다.

### 시그니처

```typescript
clearMessageList(): void
```

### 사용법

```javascript
const { clearMessageList } = KlleonChat;

// 대화 기록 초기화
clearMessageList();
```

### 설명

SDK 내부적으로 관리하는 `messageList` 배열을 비웁니다. 새로운 대화 세션을 시작하거나 이전 대화 기록을 삭제할 때 사용합니다.

---

## 전체 예제

### HTML

```html
<avatar-container></avatar-container>

<div>
  <input type="text" id="messageInput" placeholder="메시지 입력">
  <button id="sendBtn">전송</button>
  <button id="echoBtn">에코 테스트</button>
  <button id="clearBtn">대화 초기화</button>
</div>

<script>
  const { init, onStatusEvent, sendTextMessage, echo, clearMessageList } = KlleonChat;

  let isReady = false;

  onStatusEvent((status) => {
    if (status === 'VIDEO_CAN_PLAY') {
      isReady = true;
    }
  });

  init({
    sdk_key: 'YOUR_SDK_KEY',
    avatar_id: 'YOUR_AVATAR_ID',
  });

  // 메시지 전송 (AI 응답)
  document.getElementById('sendBtn').onclick = () => {
    if (!isReady) return;
    const message = document.getElementById('messageInput').value;
    if (message) sendTextMessage(message);
  };

  // 에코 (직접 발화)
  document.getElementById('echoBtn').onclick = () => {
    if (!isReady) return;
    echo('안녕하세요, 에코 테스트입니다.');
  };

  // 대화 초기화
  document.getElementById('clearBtn').onclick = () => {
    clearMessageList();
  };
</script>
```

### React

```tsx
import { useState, useEffect } from 'react';

function ChatInterface() {
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');

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
    if (isReady && message) {
      window.KlleonChat.sendTextMessage(message);
      setMessage('');
    }
  };

  const handleEcho = () => {
    if (isReady) {
      window.KlleonChat.echo('안녕하세요, 에코 테스트입니다.');
    }
  };

  return (
    <div>
      <avatar-container />

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지 입력"
      />
      <button onClick={handleSend} disabled={!isReady}>
        전송
      </button>
      <button onClick={handleEcho} disabled={!isReady}>
        에코 테스트
      </button>
      <button onClick={() => window.KlleonChat.clearMessageList()}>
        대화 초기화
      </button>
    </div>
  );
}
```

## 관련 API

- [onChatEvent()](/docs/api/events#onchatevent) - 채팅 메시지 수신
- [startStt()](/docs/api/stt) - 음성 입력
- [startAudioEcho()](/docs/api/audio-echo) - 오디오 발화
