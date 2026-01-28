---
sidebar_position: 1
---

# TypeScript 지원

TypeScript 프로젝트에서 Klleon Chat SDK를 사용하는 방법입니다.

## 사용법

CDN으로 로드된 SDK는 `window.KlleonChat` 전역 객체를 통해 접근합니다.

```typescript
const {
  init,
  onStatusEvent,
  onChatEvent,
  onErrorEvent,
  sendTextMessage,
} = window.KlleonChat;
```

## 주요 타입 정의

### InitOption

`init()` 메서드의 옵션 타입입니다.

```typescript
interface InitOption {
  sdk_key: string;
  avatar_id: string;
  voice_code?: VoiceCodeType;
  subtitle_code?: SubtitleCodeType;
  voice_tts_speech_speed?: number;
  enable_microphone?: boolean;
  log_level?: LogLevelType;
  mode?: ModeType;
  custom_id?: string;
  user_key?: string;
}

type VoiceCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id';
type SubtitleCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id';
type LogLevelType = 'debug' | 'info' | 'warn' | 'error' | 'silent';
type ModeType = 'prod' | 'dev' | 'stg' | 'demo';
```

### Status

SDK 상태 타입입니다.

```typescript
type Status =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTING_FAILED'
  | 'SOCKET_CONNECTED'
  | 'SOCKET_FAILED'
  | 'STREAMING_CONNECTED'
  | 'STREAMING_FAILED'
  | 'CONNECTED_FINISH'
  | 'VIDEO_LOAD'
  | 'VIDEO_CAN_PLAY'
  | 'DESTROYED';
```

### ChatData

채팅 이벤트 데이터 타입입니다.

```typescript
interface ChatData {
  message: string;
  chat_type: ResponseChatType;
  time: string;
  id: string;
}

type ResponseChatType =
  | 'PING'
  | 'TEXT'
  | 'STT_RESULT'
  | 'STT_ERROR'
  | 'RATE_LIMIT'
  | 'WAIT'
  | 'WARN_SUSPENDED'
  | 'DISABLED_TIME_OUT'
  | 'TEXT_ERROR'
  | 'TEXT_MODERATION'
  | 'ERROR'
  | 'RESPONSE_IS_ENDED'
  | 'RESPONSE_OK'
  | 'WORKER_DISCONNECTED'
  | 'ACTIVATE_VOICE'
  | 'PREPARING_RESPONSE'
  | 'EXCEED_CONCURRENT_QUOTA'
  | 'START_LONG_WAIT'
  | 'USER_SPEECH_STARTED'
  | 'USER_SPEECH_STOPPED'
  | 'HANDOVER_START'
  | 'HANDOVER_SUCCESS'
  | 'HANDOVER_FAIL';
```

### ErrorData

에러 이벤트 데이터 타입입니다.

```typescript
interface ErrorData {
  code: ErrorCode;
  message: string;
}

enum ErrorCode {
  SOCKET_FAILED = 'SOCKET_FAILED',
  STREAMING_FAILED = 'STREAMING_FAILED',
  STREAMING_RECONNECT_FAILED = 'STREAMING_RECONNECT_FAILED',
  VIDEO_ELEMENT_NOT_FOUND = 'VIDEO_ELEMENT_NOT_FOUND',
  SOCKET_DISCONNECTED_UNEXPECTEDLY = 'SOCKET_DISCONNECTED_UNEXPECTEDLY',
  STREAMING_DISCONNECTED_UNEXPECTEDLY = 'STREAMING_DISCONNECTED_UNEXPECTEDLY',
}
```

### ChangeAvatar

`changeAvatar()` 메서드의 옵션 타입입니다.

```typescript
interface ChangeAvatar {
  avatar_id: string;
  voice_code?: VoiceCodeType;
  subtitle_code?: SubtitleCodeType;
  voice_tts_speech_speed?: number;
}
```

## 타입 선언 파일

TypeScript 프로젝트에서 SDK를 사용하려면 타입 선언 파일이 필요합니다.

### global.d.ts

프로젝트 루트에 `global.d.ts` 파일을 생성합니다.

```typescript
// global.d.ts

// KlleonChat SDK 타입 선언
interface KlleonChatSDK {
  init: (option: InitOption) => Promise<void>;
  destroy: () => Promise<void>;
  reconnect: () => Promise<void>;
  sendTextMessage: (message: string) => void;
  echo: (message: string) => void;
  clearMessageList: () => void;
  startStt: () => void;
  endStt: () => void;
  cancelStt: () => void;
  startAudioEcho: (audio: string) => void;
  endAudioEcho: () => void;
  changeAvatar: (option: ChangeAvatar) => Promise<void>;
  stopSpeech: () => void;
  wakeUpAvatar: () => void;
  onChatEvent: (callback: (data: ChatData) => void) => void;
  onStatusEvent: (callback: (status: Status) => void) => void;
  onErrorEvent: (callback: (error: ErrorData) => void) => void;
}

declare global {
  interface Window {
    KlleonChat: KlleonChatSDK;
  }
}

// 웹 컴포넌트 타입 선언
declare namespace JSX {
  interface IntrinsicElements {
    'avatar-container': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        volume?: number | string;
      },
      HTMLElement
    >;
    'chat-container': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}

export {};
```

### tsconfig.json

`global.d.ts`가 포함되도록 설정합니다.

```json
{
  "compilerOptions": {
    // ...
  },
  "include": ["src", "global.d.ts"]
}
```

## 사용 예제

### React + TypeScript

먼저 `public/index.html`에 SDK 스크립트를 추가합니다:

```html
<script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
```

```tsx
// AvatarChat.tsx
import { useEffect, useState, useCallback, useRef } from 'react';

// 타입 정의
type Status =
  | 'IDLE'
  | 'CONNECTING'
  | 'VIDEO_CAN_PLAY'
  | 'DESTROYED'
  | string;

interface ChatData {
  message: string;
  chat_type: string;
  time: string;
  id: string;
}

interface ErrorData {
  code: string;
  message: string;
}

interface AvatarChatProps {
  sdkKey: string;
  avatarId: string;
}

function AvatarChat({ sdkKey, avatarId }: AvatarChatProps) {
  const [status, setStatus] = useState<Status>('IDLE');
  const [messages, setMessages] = useState<ChatData[]>([]);
  const [error, setError] = useState<ErrorData | null>(null);

  const isReady = status === 'VIDEO_CAN_PLAY';

  const handleReconnect = useCallback(async () => {
    try {
      setError(null);
      await window.KlleonChat.reconnect();
    } catch (e) {
      console.error('Reconnect failed', e);
    }
  }, []);

  useEffect(() => {
    const {
      init,
      destroy,
      onStatusEvent,
      onChatEvent,
      onErrorEvent,
    } = window.KlleonChat;

    // 이벤트 핸들러 등록
    onStatusEvent((newStatus: Status) => {
      setStatus(newStatus);
    });

    onChatEvent((data: ChatData) => {
      if (data.chat_type === 'TEXT' || data.chat_type === 'STT_RESULT') {
        setMessages((prev) => [...prev, data]);
      }
    });

    onErrorEvent((err: ErrorData) => {
      setError(err);

      // 연결 끊김 시 자동 재연결
      if (err.code.includes('DISCONNECTED')) {
        setTimeout(handleReconnect, 2000);
      }
    });

    // SDK 초기화
    init({
      sdk_key: sdkKey,
      avatar_id: avatarId,
      voice_code: 'ko_kr',
      log_level: 'info',
    });

    return () => {
      destroy();
    };
  }, [sdkKey, avatarId, handleReconnect]);

  const handleSendMessage = (message: string) => {
    if (isReady && message.trim()) {
      window.KlleonChat.sendTextMessage(message);
    }
  };

  return (
    <div>
      <avatar-container
        style={{ display: 'block', width: 400, height: 600 }}
      />

      <p>상태: {status}</p>

      {error && (
        <div>
          에러: {error.code} - {error.message}
          <button onClick={handleReconnect}>재연결</button>
        </div>
      )}

      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            [{msg.chat_type}] {msg.message}
          </li>
        ))}
      </ul>

      <ChatInput onSend={handleSendMessage} disabled={!isReady} />
    </div>
  );
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="메시지 입력"
      />
      <button type="submit" disabled={disabled}>
        전송
      </button>
    </form>
  );
}

export default AvatarChat;
```

## 타입 가드 활용

채팅 타입에 따라 다르게 처리하는 타입 가드 예제입니다.

```typescript
type AvatarMessage = ChatData & { chat_type: 'TEXT' };
type UserMessage = ChatData & { chat_type: 'STT_RESULT' };

function isAvatarMessage(data: ChatData): data is AvatarMessage {
  return data.chat_type === 'TEXT';
}

function isUserMessage(data: ChatData): data is UserMessage {
  return data.chat_type === 'STT_RESULT';
}

// 사용 예
const { onChatEvent } = window.KlleonChat;

onChatEvent((data) => {
  if (isAvatarMessage(data)) {
    console.log('아바타:', data.message);
  } else if (isUserMessage(data)) {
    console.log('사용자:', data.message);
  }
});
```

## 관련 항목

- [init()](/docs/api/init) - 초기화 옵션
- [이벤트](/docs/api/events) - 이벤트 타입
- [에러 처리](/docs/guides/error-handling) - 에러 코드
