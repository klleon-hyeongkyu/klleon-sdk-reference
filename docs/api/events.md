---
sidebar_position: 7
---

# Events

SDK 이벤트를 구독하는 메서드입니다.

## onChatEvent()

채팅 메시지 이벤트를 구독합니다.

### 시그니처

```typescript
onChatEvent(callback: (data: ChatData) => void): void
```

### 매개변수

#### ChatData

| 속성 | 타입 | 설명 |
|------|------|------|
| `message` | `string` | 메시지 내용 |
| `chat_type` | `ResponseChatType` | 채팅 타입 |
| `time` | `string` | 타임스탬프 |
| `id` | `string` | 메시지 ID |

### 채팅 타입 (ResponseChatType)

| 타입 | 설명 |
|------|------|
| `PING` | 연결 유지 핑 |
| `TEXT` | 아바타 응답 메시지 |
| `STT_RESULT` | 음성 인식 결과 |
| `STT_ERROR` | 음성 인식 오류 |
| `RATE_LIMIT` | 요청 제한 초과 |
| `WAIT` | 채팅 시작 대기 |
| `WARN_SUSPENDED` | 10초 후 대기 상태 전환 경고 |
| `DISABLED_TIME_OUT` | 타임아웃으로 대화 중지 |
| `TEXT_ERROR` | 텍스트 전송 오류 |
| `TEXT_MODERATION` | 부적절한 언어 감지 |
| `ERROR` | 서버 오류 |
| `RESPONSE_IS_ENDED` | 아바타 응답 완료 |
| `RESPONSE_OK` | 응답 정상 수신 |
| `WORKER_DISCONNECTED` | 스트리밍 종료 |
| `ACTIVATE_VOICE` | 음성 인식 활성화 |
| `PREPARING_RESPONSE` | 응답 준비 중 |
| `EXCEED_CONCURRENT_QUOTA` | 동시 접속 제한 초과 |
| `START_LONG_WAIT` | 대기 상태 진입 |
| `USER_SPEECH_STARTED` | 사용자 음성 인식 시작 |
| `USER_SPEECH_STOPPED` | 사용자 음성 인식 종료 |
| `HANDOVER_START` | 핸드오버 시작 |
| `HANDOVER_SUCCESS` | 핸드오버 성공 |
| `HANDOVER_FAIL` | 핸드오버 실패 |

### 사용법

```javascript
const { onChatEvent } = KlleonChat;

onChatEvent((data) => {
  console.log(`[${data.chat_type}] ${data.message}`);

  switch (data.chat_type) {
    case 'TEXT':
      // 아바타 응답 처리
      displayAvatarMessage(data.message);
      break;
    case 'STT_RESULT':
      // 음성 인식 결과 처리
      displayUserMessage(data.message);
      break;
    case 'TEXT_ERROR':
      // 전송 오류 처리
      showError('메시지 전송 실패');
      break;
  }
});
```

---

## onStatusEvent()

SDK 상태 변경 이벤트를 구독합니다.

### 시그니처

```typescript
onStatusEvent(callback: (status: Status) => void): void
```

### 상태 값 (Status)

| 상태 | 설명 |
|------|------|
| `IDLE` | 초기 상태 (미연결) |
| `CONNECTING` | 연결 중 |
| `CONNECTING_FAILED` | 연결 실패 |
| `SOCKET_CONNECTED` | WebSocket 연결됨 |
| `SOCKET_FAILED` | WebSocket 연결 실패 |
| `STREAMING_CONNECTED` | 스트리밍 연결됨 |
| `STREAMING_FAILED` | 스트리밍 연결 실패 |
| `CONNECTED_FINISH` | 연결 완료 |
| `VIDEO_LOAD` | 비디오 로딩 중 |
| `VIDEO_CAN_PLAY` | 비디오 재생 가능 (준비 완료) |
| `DESTROYED` | SDK 종료됨 |

### 상태 흐름

```
정상 흐름:
IDLE → CONNECTING → SOCKET_CONNECTED → STREAMING_CONNECTED → CONNECTED_FINISH → VIDEO_LOAD → VIDEO_CAN_PLAY

실패 흐름:
IDLE → CONNECTING → CONNECTING_FAILED
IDLE → CONNECTING → SOCKET_FAILED
IDLE → CONNECTING → SOCKET_CONNECTED → STREAMING_FAILED

종료 흐름:
VIDEO_CAN_PLAY → DESTROYED
```

### 사용법

```javascript
const { onStatusEvent } = KlleonChat;

onStatusEvent((status) => {
  console.log('상태:', status);

  switch (status) {
    case 'VIDEO_CAN_PLAY':
      // 아바타 준비 완료
      enableChatInput();
      break;
    case 'CONNECTING':
      showLoadingSpinner();
      break;
    case 'CONNECTING_FAILED':
    case 'SOCKET_FAILED':
    case 'STREAMING_FAILED':
      showConnectionError();
      break;
    case 'DESTROYED':
      disableChatInput();
      break;
  }
});
```

---

## onErrorEvent()

에러 이벤트를 구독합니다.

### 시그니처

```typescript
onErrorEvent(callback: (error: ErrorData) => void): void
```

### 매개변수

#### ErrorData

| 속성 | 타입 | 설명 |
|------|------|------|
| `code` | `ErrorCode` | 에러 코드 |
| `message` | `string` | 에러 메시지 |

### 에러 코드 (ErrorCode)

| 코드 | 설명 |
|------|------|
| `SOCKET_FAILED` | WebSocket 연결 실패 |
| `STREAMING_FAILED` | 스트리밍 연결 실패 |
| `STREAMING_RECONNECT_FAILED` | 스트리밍 재연결 실패 |
| `VIDEO_ELEMENT_NOT_FOUND` | 비디오 요소를 찾을 수 없음 |
| `SOCKET_DISCONNECTED_UNEXPECTEDLY` | 예기치 않은 WebSocket 연결 끊김 |
| `STREAMING_DISCONNECTED_UNEXPECTEDLY` | 예기치 않은 스트리밍 연결 끊김 |

### 사용법

```javascript
const { onErrorEvent, reconnect } = KlleonChat;

onErrorEvent((error) => {
  console.error(`에러 [${error.code}]: ${error.message}`);

  switch (error.code) {
    case 'SOCKET_DISCONNECTED_UNEXPECTEDLY':
    case 'STREAMING_DISCONNECTED_UNEXPECTEDLY':
      // 재연결 시도
      reconnect();
      break;
    case 'VIDEO_ELEMENT_NOT_FOUND':
      // avatar-container 확인
      alert('아바타 컨테이너를 찾을 수 없습니다.');
      break;
    default:
      showError(error.message);
  }
});
```

---

## 전체 예제

### HTML

```html
<avatar-container></avatar-container>

<div id="statusBadge">상태: 대기 중</div>
<div id="chatLog"></div>

<script>
  const { init, onStatusEvent, onChatEvent, onErrorEvent, reconnect } = KlleonChat;

  const statusBadge = document.getElementById('statusBadge');
  const chatLog = document.getElementById('chatLog');

  // 상태 이벤트
  onStatusEvent((status) => {
    statusBadge.textContent = `상태: ${status}`;
    statusBadge.className = status === 'VIDEO_CAN_PLAY' ? 'ready' : 'loading';
  });

  // 채팅 이벤트
  onChatEvent((data) => {
    const messageEl = document.createElement('div');
    messageEl.className = data.chat_type === 'TEXT' ? 'avatar-msg' : 'user-msg';
    messageEl.textContent = `[${data.chat_type}] ${data.message}`;
    chatLog.appendChild(messageEl);
    chatLog.scrollTop = chatLog.scrollHeight;
  });

  // 에러 이벤트
  let reconnectAttempts = 0;

  onErrorEvent((error) => {
    console.error('에러:', error.code, error.message);

    // 연결 끊김 시 재연결
    if (error.code.includes('DISCONNECTED')) {
      if (reconnectAttempts < 3) {
        reconnectAttempts++;
        console.log(`재연결 시도 ${reconnectAttempts}/3`);
        setTimeout(reconnect, 2000);
      }
    }
  });

  init({
    sdk_key: 'YOUR_SDK_KEY',
    avatar_id: 'YOUR_AVATAR_ID',
  });
</script>
```

### React

```tsx
import { useEffect, useState, useCallback } from 'react';

interface Message {
  type: string;
  content: string;
  time: string;
}

function ChatApp() {
  const [status, setStatus] = useState<string>('IDLE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleReconnect = useCallback(async () => {
    try {
      setError(null);
      await window.KlleonChat.reconnect();
    } catch (e) {
      setError('재연결 실패');
    }
  }, []);

  useEffect(() => {
    const { init, destroy, onStatusEvent, onChatEvent, onErrorEvent } = window.KlleonChat;

    // 상태 이벤트
    onStatusEvent((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'VIDEO_CAN_PLAY') {
        setError(null);
      }
    });

    // 채팅 이벤트
    onChatEvent((data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: data.chat_type,
          content: data.message,
          time: data.time,
        },
      ]);
    });

    // 에러 이벤트
    onErrorEvent((err) => {
      setError(`${err.code}: ${err.message}`);

      // 연결 끊김 시 자동 재연결
      if (err.code.includes('DISCONNECTED')) {
        setTimeout(handleReconnect, 2000);
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    return () => destroy();
  }, [handleReconnect]);

  const isReady = status === 'VIDEO_CAN_PLAY';

  return (
    <div>
      <avatar-container />

      <div className={`status-badge ${isReady ? 'ready' : ''}`}>
        상태: {status}
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={handleReconnect}>재연결</button>
        </div>
      )}

      <div className="chat-log">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.type === 'TEXT' ? 'avatar-msg' : 'user-msg'}
          >
            <span className="type">[{msg.type}]</span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 이벤트 구독 시점

:::warning init() 전에 구독
이벤트 핸들러는 `init()` 호출 **전에** 등록하세요. 그래야 초기화 과정의 모든 상태 변경을 수신할 수 있습니다.
:::

```javascript
// 올바른 순서
onStatusEvent((status) => { /* ... */ });
onChatEvent((data) => { /* ... */ });
onErrorEvent((error) => { /* ... */ });

init({ /* ... */ }); // 이벤트 구독 후 초기화
```

## 관련 API

- [init()](/docs/api/init) - SDK 초기화
- [reconnect()](/docs/api/lifecycle#reconnect) - 재연결
- [에러 처리](/docs/guides/error-handling) - 에러 코드 상세 설명
