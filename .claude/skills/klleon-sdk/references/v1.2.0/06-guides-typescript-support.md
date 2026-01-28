# Klleon Chat SDK TypeScript 지원

## 개요

Klleon Chat SDK는 TypeScript 프로젝트 개발을 위해 타입 정의 파일(`.d.ts`)을 제공하며, 이를 통해 타입 안정성과 개선된 개발 경험을 제공합니다.

## 타입 정의 파일 (KlleonSDK.d.ts)

SDK는 다음의 주요 타입과 인터페이스를 정의합니다:

### 기본 타입

```typescript
// 연결 상태 관련 타입
type BaseStatus = "IDLE" | "CONNECTING" | "CONNECTING_FAILED" | "SOCKET_CONNECTED" |
                  "SOCKET_FAILED" | "STREAMING_CONNECTED" | "STREAMING_FAILED" |
                  "CONNECTED_FINISH" | "VIDEO_LOAD" | "VIDEO_CAN_PLAY";

// 로그 레벨 타입
type BaseLogLevelType = "debug" | "info" | "warn" | "error" | "silent";

// 음성 코드 타입
type BaseVoiceCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";

// 자막 코드 타입
type BaseSubtitleCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";

// 환경 모드 타입
type BaseModeType = "prod" | "dev" | "stg" | "demo";
```

### ResponseChatType 열거형

```typescript
enum ResponseChatType {
  TEXT = "TEXT",
  STT_RESULT = "STT_RESULT",
  STT_ERROR = "STT_ERROR",
  WAIT = "WAIT",
  WARN_SUSPENDED = "WARN_SUSPENDED",
  DISABLED_TIME_OUT = "DISABLED_TIME_OUT",
  TEXT_ERROR = "TEXT_ERROR",
  TEXT_MODERATION = "TEXT_MODERATION",
  ERROR = "ERROR",
  PREPARING_RESPONSE = "PREPARING_RESPONSE",
  RESPONSE_IS_ENDED = "RESPONSE_IS_ENDED",
  RESPONSE_OK = "RESPONSE_OK",
  WORKER_DISCONNECTED = "WORKER_DISCONNECTED",
  EXCEED_CONCURRENT_QUOTA = "EXCEED_CONCURRENT_QUOTA",
  START_LONG_WAIT = "START_LONG_WAIT",
  USER_SPEECH_STARTED = "USER_SPEECH_STARTED",
  USER_SPEECH_STOPPED = "USER_SPEECH_STOPPED",
}
```

### 주요 인터페이스

```typescript
// SDK 초기화 옵션
interface InitOption {
  sdk_key: string;
  avatar_id: string;
  subtitle_code?: BaseSubtitleCodeType;
  voice_code?: BaseVoiceCodeType;
  voice_tts_speech_speed?: number;
  enable_microphone?: boolean;
  log_level?: BaseLogLevelType;
  mode?: BaseModeType;
  custom_id?: string;
  user_key?: string;
}

// 채팅 데이터 구조
interface ChatData {
  message: string;
  chat_type: ResponseChatType;
  time: string;
  id: string;
}

// 아바타 변경 옵션
interface ChangeAvatarOption {
  avatar_id: string;
  subtitle_code?: BaseSubtitleCodeType;
  voice_code?: BaseVoiceCodeType;
  voice_tts_speech_speed?: number;
}

// SDK 메인 인터페이스
interface KlleonChat {
  init(options: InitOption): Promise<void>;
  destroy(): void;
  sendTextMessage(text: string): void;
  startStt(): void;
  endStt(): void;
  cancelStt(): void;
  stopSpeech(): void;
  echo(text: string): void;
  startAudioEcho(audio: string): void;
  endAudioEcho(): void;
  changeAvatar(option: ChangeAvatarOption): Promise<void>;
  clearMessageList(): void;
  onChatEvent(callback: (data: ChatData) => void): void;
  onStatusEvent(callback: (status: BaseStatus) => void): void;
}
```

## tsconfig.json 설정

타입 정의 파일을 인식하도록 다음과 같이 설정합니다:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["KlleonSDK.d.ts"]
}
```

`include` 배열에 타입 정의 파일 경로를 추가하여 TypeScript 컴파일러가 인식하도록 합니다.
