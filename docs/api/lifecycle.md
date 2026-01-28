---
sidebar_position: 2
---

# Lifecycle

SDK 생명주기를 관리하는 메서드입니다.

## destroy()

SDK 리소스를 정리하고 서버 연결을 종료합니다.

### 시그니처

```typescript
destroy(): Promise<void>
```

### 사용법

```javascript
const { destroy } = KlleonChat;

// 페이지 종료 시 정리
window.addEventListener('beforeunload', () => {
  destroy();
});
```

### React 예제

```tsx
import { useEffect } from 'react';

function AvatarChat() {
  useEffect(() => {
    const { init, destroy } = window.KlleonChat;

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      destroy();
    };
  }, []);

  return <avatar-container />;
}
```

### 동작

1. 이벤트 리스너 제거 (`onChatEvent`, `onStatusEvent`, `onErrorEvent`)
2. WebSocket 연결 종료
3. Agora RTC 연결 종료
4. SDK 상태 초기화

### 주의사항

:::warning
`IDLE` 상태에서 `destroy()`를 호출하면 무시됩니다. 이미 초기화되지 않은 상태이기 때문입니다.
:::

:::info
`destroy()` 완료 후 상태는 `DESTROYED`가 됩니다. 다시 사용하려면 새로운 `init()` 호출이 필요합니다.
:::

---

## reconnect()

연결이 끊어졌을 때 아바타 서버에 재연결을 시도합니다.

### 시그니처

```typescript
reconnect(): Promise<void>
```

### 사용법

```javascript
const { reconnect, onErrorEvent } = KlleonChat;

onErrorEvent((error) => {
  if (error.code === 'SOCKET_DISCONNECTED_UNEXPECTEDLY' ||
      error.code === 'STREAMING_DISCONNECTED_UNEXPECTEDLY') {
    // 재연결 시도
    reconnect();
  }
});
```

### 재연결 가능 상태

`reconnect()`는 다음 상태에서만 동작합니다:

| 상태 | 재연결 가능 |
|------|-------------|
| `CONNECTING` | O |
| `SOCKET_CONNECTED` | O |
| `STREAMING_CONNECTED` | O |
| `CONNECTED_FINISH` | O |
| `VIDEO_LOAD` | O |
| `VIDEO_CAN_PLAY` | O |
| `SOCKET_FAILED` | O |
| `STREAMING_FAILED` | O |
| `IDLE` | X |
| `CONNECTING_FAILED` | X |
| `DESTROYED` | X |

### 주의사항

:::warning 재연결 불가 상태
`IDLE`, `CONNECTING_FAILED`, `DESTROYED` 상태에서는 `reconnect()`가 동작하지 않습니다. 이 경우 새로운 `init()`을 호출해야 합니다.
:::

:::tip
재연결 중에는 `isReconnecting` 상태가 `true`가 됩니다. 중복 호출은 무시됩니다.
:::

### 예제: 에러 시 재연결

```javascript
const { init, reconnect, onStatusEvent, onErrorEvent } = KlleonChat;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

onErrorEvent(async (error) => {
  console.error('에러:', error.code);

  // 연결 끊김 에러 처리
  if (error.code === 'SOCKET_DISCONNECTED_UNEXPECTEDLY' ||
      error.code === 'STREAMING_DISCONNECTED_UNEXPECTEDLY') {

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);

      try {
        await reconnect();
        reconnectAttempts = 0; // 성공 시 카운터 초기화
      } catch (e) {
        console.error('재연결 실패');
      }
    } else {
      console.error('최대 재연결 시도 횟수 초과');
    }
  }
});

onStatusEvent((status) => {
  if (status === 'VIDEO_CAN_PLAY') {
    reconnectAttempts = 0; // 연결 완료 시 카운터 초기화
  }
});

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

## 관련 API

- [init()](/docs/api/init) - SDK 초기화
- [onStatusEvent()](/docs/api/events#onstatusevent) - 상태 변경 구독
- [onErrorEvent()](/docs/api/events#onerrorevent) - 에러 구독
