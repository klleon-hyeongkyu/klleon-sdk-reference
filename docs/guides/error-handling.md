---
sidebar_position: 2
---

# 에러 처리

SDK에서 발생하는 에러와 대응 방법을 안내합니다.

## 에러 코드

### ErrorCode

SDK 런타임에서 발생하는 에러 코드입니다. `onErrorEvent()`로 수신합니다.

| 코드 | 설명 | 대응 방법 |
|------|------|-----------|
| `SOCKET_FAILED` | WebSocket 연결 실패 | 네트워크 상태 확인 후 `reconnect()` 또는 `init()` 재시도 |
| `STREAMING_FAILED` | 스트리밍(Agora) 연결 실패 | 네트워크 상태 확인 후 `reconnect()` 시도 |
| `STREAMING_RECONNECT_FAILED` | 스트리밍 재연결 실패 | `init()`으로 완전히 재초기화 |
| `VIDEO_ELEMENT_NOT_FOUND` | 비디오 요소를 찾을 수 없음 | `<avatar-container>` 요소 존재 여부 확인 |
| `SOCKET_DISCONNECTED_UNEXPECTEDLY` | 예기치 않은 WebSocket 연결 끊김 | `reconnect()` 시도 |
| `STREAMING_DISCONNECTED_UNEXPECTEDLY` | 예기치 않은 스트리밍 연결 끊김 | `reconnect()` 시도 |

### ConnectionStatusException

API 연결 시 발생하는 서버 측 에러입니다.

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `INVALID_SDK_KEY` | 401 | 유효하지 않은 SDK 키 |
| `NOT_ALLOWED_ORIGIN` | 403 | 허용되지 않은 도메인 |
| `AVATAR_ID_MALFORMED_REQUEST` | 400 | 잘못된 아바타 ID 형식 |
| `AVATAR_NOT_FOUND` | 404 | 존재하지 않는 아바타 |
| `AVATAR_NOT_AVAILABLE` | 503 | 아바타 서비스 불가 |
| `EXCEED_CONCURRENT_QUOTA` | 429 | 동시 접속 제한 초과 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

## 에러 핸들링 패턴

### 기본 에러 핸들링

```javascript
const { init, onErrorEvent, reconnect } = KlleonChat;

onErrorEvent((error) => {
  console.error(`[${error.code}] ${error.message}`);

  switch (error.code) {
    case 'SOCKET_DISCONNECTED_UNEXPECTEDLY':
    case 'STREAMING_DISCONNECTED_UNEXPECTEDLY':
      // 자동 재연결
      reconnect();
      break;

    case 'VIDEO_ELEMENT_NOT_FOUND':
      // UI 확인 필요
      alert('아바타 컨테이너를 찾을 수 없습니다.');
      break;

    default:
      // 일반 에러 표시
      showErrorToast(error.message);
  }
});

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

### 재연결 로직 구현

```javascript
const { init, onStatusEvent, onErrorEvent, reconnect } = KlleonChat;

let reconnectAttempts = 0;
const MAX_RECONNECT = 3;
const RECONNECT_DELAY = 2000; // 2초

function handleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) {
    console.error('최대 재연결 시도 횟수 초과');
    showReconnectPrompt(); // 사용자에게 수동 재연결 안내
    return;
  }

  reconnectAttempts++;
  console.log(`재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT}`);

  setTimeout(async () => {
    try {
      await reconnect();
    } catch (e) {
      console.error('재연결 실패');
      handleReconnect(); // 재귀 호출로 재시도
    }
  }, RECONNECT_DELAY * reconnectAttempts); // 점진적 지연
}

onStatusEvent((status) => {
  if (status === 'VIDEO_CAN_PLAY') {
    reconnectAttempts = 0; // 성공 시 카운터 초기화
  }
});

onErrorEvent((error) => {
  if (error.code.includes('DISCONNECTED')) {
    handleReconnect();
  }
});

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

### 채팅 에러 처리

```javascript
const { onChatEvent, sendTextMessage } = KlleonChat;

onChatEvent((data) => {
  switch (data.chat_type) {
    case 'TEXT_ERROR':
      // 메시지 전송 실패
      showError('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      break;

    case 'TEXT_MODERATION':
      // 부적절한 언어 감지
      showWarning('부적절한 표현이 감지되었습니다.');
      break;

    case 'STT_ERROR':
      // 음성 인식 실패
      showError('음성 인식에 실패했습니다. 다시 시도해주세요.');
      break;

    case 'RATE_LIMIT':
      // 요청 제한
      showWarning('잠시 후 다시 시도해주세요.');
      break;

    case 'EXCEED_CONCURRENT_QUOTA':
      // 동시 접속 제한
      showError('현재 접속자가 많습니다. 나중에 다시 시도해주세요.');
      break;

    case 'ERROR':
      // 서버 오류
      showError('서버 오류가 발생했습니다.');
      break;
  }
});
```

## React 에러 처리 예제

```tsx
import { useEffect, useState, useCallback, useRef } from 'react';

interface Error {
  code: string;
  message: string;
}

function AvatarChat() {
  const [status, setStatus] = useState('IDLE');
  const [error, setError] = useState<Error | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttemptsRef = useRef(0);

  const handleReconnect = useCallback(async () => {
    if (reconnectAttemptsRef.current >= 3) {
      setError({
        code: 'MAX_RECONNECT_EXCEEDED',
        message: '재연결 시도 횟수를 초과했습니다.',
      });
      return;
    }

    setIsReconnecting(true);
    reconnectAttemptsRef.current++;

    try {
      await window.KlleonChat.reconnect();
      setError(null);
    } catch (e) {
      // 재시도
      setTimeout(handleReconnect, 2000 * reconnectAttemptsRef.current);
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  useEffect(() => {
    const { init, destroy, onStatusEvent, onChatEvent, onErrorEvent } = window.KlleonChat;

    onStatusEvent((newStatus) => {
      setStatus(newStatus);

      if (newStatus === 'VIDEO_CAN_PLAY') {
        reconnectAttemptsRef.current = 0;
        setError(null);
      }

      if (newStatus === 'CONNECTING_FAILED') {
        setError({
          code: 'CONNECTING_FAILED',
          message: '연결에 실패했습니다.',
        });
      }
    });

    onChatEvent((data) => {
      // 채팅 에러 처리
      if (['TEXT_ERROR', 'STT_ERROR', 'ERROR'].includes(data.chat_type)) {
        setError({
          code: data.chat_type,
          message: data.message || '오류가 발생했습니다.',
        });
      }
    });

    onErrorEvent((err) => {
      setError(err);

      // 연결 끊김 시 자동 재연결
      if (err.code.includes('DISCONNECTED')) {
        handleReconnect();
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

      {/* 상태 표시 */}
      <StatusBadge status={status} isReconnecting={isReconnecting} />

      {/* 에러 배너 */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={handleReconnect}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 채팅 UI */}
      <ChatInterface disabled={!isReady || isReconnecting} />
    </div>
  );
}

function StatusBadge({ status, isReconnecting }) {
  if (isReconnecting) {
    return <span className="status reconnecting">재연결 중...</span>;
  }

  const statusMap = {
    IDLE: '대기',
    CONNECTING: '연결 중...',
    VIDEO_CAN_PLAY: '준비 완료',
    DESTROYED: '종료됨',
  };

  return <span className="status">{statusMap[status] || status}</span>;
}

function ErrorBanner({ error, onRetry, onDismiss }) {
  return (
    <div className="error-banner">
      <span>[{error.code}] {error.message}</span>
      <button onClick={onRetry}>재시도</button>
      <button onClick={onDismiss}>닫기</button>
    </div>
  );
}
```

## 디버깅 팁

### 로그 레벨 설정

개발 중에는 `log_level: 'debug'`로 상세 로그를 확인하세요.

```javascript
init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
  log_level: 'debug', // 상세 로그 출력
});
```

### 브라우저 개발자 도구

- **Console**: SDK 로그와 에러 메시지 확인
- **Network**: WebSocket 연결 상태 확인 (`ws://` 또는 `wss://`)
- **Application > Permissions**: 마이크 권한 상태 확인

### 일반적인 문제 해결

| 문제 | 원인 | 해결 방법 |
|------|------|-----------|
| 아바타가 표시되지 않음 | `<avatar-container>` 누락 | HTML에 요소 추가 |
| 연결 실패 | 잘못된 SDK 키 | Klleon 콘솔에서 키 확인 |
| CORS 에러 | 허용되지 않은 도메인 | Klleon 콘솔에서 도메인 등록 |
| 마이크 작동 안 함 | HTTP 환경 | HTTPS로 변경 |
| 음성 인식 안 됨 | 권한 거부 | 브라우저 권한 설정 확인 |

## 관련 항목

- [onErrorEvent()](/docs/api/events#onerrorevent) - 에러 이벤트 구독
- [reconnect()](/docs/api/lifecycle#reconnect) - 재연결
- [init()](/docs/api/init) - SDK 초기화
