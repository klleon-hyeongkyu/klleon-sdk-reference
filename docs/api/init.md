---
sidebar_position: 1
---

# init()

SDK를 초기화하고 아바타 서버에 연결합니다.

## 시그니처

```typescript
init(option: InitOption): Promise<void>
```

## 매개변수

### InitOption

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `sdk_key` | `string` | **필수** | - | Klleon 콘솔에서 발급받은 SDK 키 |
| `avatar_id` | `string` | **필수** | - | 사용할 아바타 ID |
| `voice_code` | `VoiceCodeType` | 선택 | `"ko_kr"` | 아바타 음성 언어 |
| `subtitle_code` | `SubtitleCodeType` | 선택 | `"ko_kr"` | 자막 언어 |
| `voice_tts_speech_speed` | `number` | 선택 | `1.0` | TTS 발화 속도 (0.5 ~ 2.0) |
| `enable_microphone` | `boolean` | 선택 | `true` | 마이크 사용 여부 |
| `log_level` | `LogLevelType` | 선택 | `"debug"` | 로그 출력 레벨 |
| `mode` | `ModeType` | 선택 | `"prod"` | 서버 모드 |
| `custom_id` | `string` | 선택 | - | 커스텀 세션 식별자 |
| `user_key` | `string` | 선택 | - | 사용자 식별 키 |

### 타입 정의

```typescript
type VoiceCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";
type SubtitleCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";
type LogLevelType = "debug" | "info" | "warn" | "error" | "silent";
type ModeType = "prod" | "dev" | "stg" | "demo";
```

## 사용법

### 기본 사용

```javascript
const { init } = KlleonChat;

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

### 전체 옵션 사용

```javascript
const { init } = KlleonChat;

init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
  voice_code: 'en_us',
  subtitle_code: 'en_us',
  voice_tts_speech_speed: 1.2,
  enable_microphone: true,
  log_level: 'info',
  custom_id: 'session-123',
  user_key: 'user-456',
});
```

### HTML 전체 예제

```html
<script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
<script>
  const { init } = KlleonChat;

  init({
    sdk_key: 'YOUR_SDK_KEY',
    avatar_id: 'YOUR_AVATAR_ID',
  });
</script>
```

## 초기화 흐름

`init()` 호출 후 SDK는 다음 상태를 순서대로 거칩니다:

```
IDLE
  ↓
CONNECTING
  ↓
SOCKET_CONNECTED
  ↓
STREAMING_CONNECTED
  ↓
CONNECTED_FINISH
  ↓
VIDEO_LOAD
  ↓
VIDEO_CAN_PLAY  ← 이 상태부터 메서드 호출 가능
```

## 주의사항

:::warning 초기화 전 이벤트 구독
`init()` 호출 전에 `onStatusEvent()`, `onChatEvent()`, `onErrorEvent()`를 먼저 구독하세요. 초기화 과정의 상태 변경을 놓칠 수 있습니다.
:::

:::tip VIDEO_CAN_PLAY 대기
`sendTextMessage()`, `startStt()` 등의 메서드는 `VIDEO_CAN_PLAY` 상태가 되어야 정상 동작합니다.
:::

:::caution 중복 초기화 방지
이미 초기화가 진행 중이거나 완료된 상태에서 `init()`을 다시 호출하면 무시됩니다.
:::

## 예제: 초기화 완료 대기

```javascript
const { init, onStatusEvent, sendTextMessage } = KlleonChat;

// 상태 이벤트 구독 (init 전에 호출)
onStatusEvent((status) => {
  console.log('상태:', status);

  if (status === 'VIDEO_CAN_PLAY') {
    // 아바타 준비 완료
    sendTextMessage('안녕하세요!');
  }

  if (status === 'CONNECTING_FAILED') {
    console.error('연결 실패');
  }
});

// SDK 초기화
init({
  sdk_key: 'YOUR_SDK_KEY',
  avatar_id: 'YOUR_AVATAR_ID',
});
```

## 관련 API

- [destroy()](/docs/api/lifecycle#destroy) - SDK 리소스 정리
- [reconnect()](/docs/api/lifecycle#reconnect) - 재연결
- [onStatusEvent()](/docs/api/events#onstatusevent) - 상태 변경 구독
