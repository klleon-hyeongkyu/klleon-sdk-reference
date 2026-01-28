---
sidebar_position: 6
---

# Avatar Control

아바타를 제어하는 메서드입니다.

## changeAvatar()

현재 연결된 아바타를 다른 아바타로 변경합니다.

### 시그니처

```typescript
changeAvatar(option: ChangeAvatar): Promise<void>
```

### 매개변수

#### ChangeAvatar

| 속성 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `avatar_id` | `string` | **필수** | - | 변경할 아바타 ID |
| `voice_code` | `VoiceCodeType` | 선택 | `"ko_kr"` | 아바타 음성 언어 |
| `subtitle_code` | `SubtitleCodeType` | 선택 | `"ko_kr"` | 자막 언어 |
| `voice_tts_speech_speed` | `number` | 선택 | `1.0` | TTS 발화 속도 |

### 사용법

```javascript
const { changeAvatar } = KlleonChat;

// 다른 아바타로 변경
await changeAvatar({
  avatar_id: 'NEW_AVATAR_ID',
  voice_code: 'en_us',
  subtitle_code: 'en_us',
  voice_tts_speech_speed: 1.0,
});
```

### 동작

1. 현재 WebSocket/Agora 연결 종료
2. 새 아바타로 연결 재설정
3. 연결 완료 시 `VIDEO_CAN_PLAY` 상태로 전환

### 주의사항

:::warning 초기화 완료 후 호출
`changeAvatar()`는 SDK 초기화가 완료된 후에만 사용할 수 있습니다. 초기화 전에 호출하면 무시됩니다.
:::

:::info 중복 호출 방지
아바타 변경 중에 `changeAvatar()`를 다시 호출하면 무시됩니다.
:::

---

## stopSpeech()

아바타의 현재 발화를 중단합니다.

### 시그니처

```typescript
stopSpeech(): void
```

### 사용법

```javascript
const { stopSpeech } = KlleonChat;

// 아바타 발화 중지
stopSpeech();
```

### 설명

아바타가 응답 중일 때 발화를 즉시 중단합니다. 사용자가 아바타의 응답을 건너뛰고 싶을 때 사용합니다.

---

## wakeUpAvatar()

대기 상태의 아바타를 활성화합니다.

### 시그니처

```typescript
wakeUpAvatar(): void
```

### 사용법

```javascript
const { wakeUpAvatar } = KlleonChat;

// 아바타 깨우기
wakeUpAvatar();
```

### 설명

일정 시간 동안 대화가 없으면 아바타가 대기 상태(`START_LONG_WAIT`)로 전환됩니다. `wakeUpAvatar()`를 호출하면 아바타를 다시 활성 상태로 깨웁니다.

### 관련 이벤트

| 이벤트 | 설명 |
|--------|------|
| `WARN_SUSPENDED` | 10초 후 대기 상태 전환 경고 |
| `DISABLED_TIME_OUT` | 타임아웃으로 대화 중지 |
| `START_LONG_WAIT` | 대기 상태 진입 |

---

## 전체 예제

### HTML

```html
<avatar-container></avatar-container>

<div>
  <select id="avatarSelect">
    <option value="avatar1">아바타 1</option>
    <option value="avatar2">아바타 2</option>
    <option value="avatar3">아바타 3</option>
  </select>
  <button id="changeBtn">아바타 변경</button>
  <button id="stopBtn">발화 중지</button>
  <button id="wakeBtn">깨우기</button>
</div>

<script>
  const {
    init,
    onStatusEvent,
    onChatEvent,
    changeAvatar,
    stopSpeech,
    wakeUpAvatar,
  } = KlleonChat;

  let isReady = false;
  let isChanging = false;

  onStatusEvent((status) => {
    console.log('상태:', status);
    if (status === 'VIDEO_CAN_PLAY') {
      isReady = true;
      isChanging = false;
    }
  });

  onChatEvent((data) => {
    // 대기 상태 경고 처리
    if (data.chat_type === 'WARN_SUSPENDED') {
      console.log('10초 후 대기 상태로 전환됩니다.');
    }
    if (data.chat_type === 'START_LONG_WAIT') {
      console.log('아바타가 대기 상태입니다.');
    }
  });

  init({
    sdk_key: 'YOUR_SDK_KEY',
    avatar_id: 'avatar1',
  });

  // 아바타 변경
  document.getElementById('changeBtn').addEventListener('click', async () => {
    if (!isReady || isChanging) return;

    isChanging = true;
    const newAvatarId = document.getElementById('avatarSelect').value;

    try {
      await changeAvatar({
        avatar_id: newAvatarId,
      });
      console.log('아바타 변경 완료');
    } catch (error) {
      console.error('아바타 변경 실패', error);
      isChanging = false;
    }
  });

  // 발화 중지
  document.getElementById('stopBtn').addEventListener('click', () => {
    stopSpeech();
  });

  // 아바타 깨우기
  document.getElementById('wakeBtn').addEventListener('click', () => {
    wakeUpAvatar();
  });
</script>
```

### React

```tsx
import { useState, useEffect } from 'react';

const AVATARS = [
  { id: 'avatar1', name: '아바타 1' },
  { id: 'avatar2', name: '아바타 2' },
  { id: 'avatar3', name: '아바타 3' },
];

function AvatarController() {
  const [isReady, setIsReady] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('avatar1');
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    const { init, destroy, onStatusEvent, onChatEvent } = window.KlleonChat;

    onStatusEvent((status) => {
      if (status === 'VIDEO_CAN_PLAY') {
        setIsReady(true);
        setIsChanging(false);
      }
    });

    onChatEvent((data) => {
      if (data.chat_type === 'START_LONG_WAIT') {
        setIsSleeping(true);
      }
      if (data.chat_type === 'TEXT' || data.chat_type === 'STT_RESULT') {
        setIsSleeping(false);
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: currentAvatar,
    });

    return () => destroy();
  }, []);

  const handleChangeAvatar = async (avatarId: string) => {
    if (!isReady || isChanging) return;

    setIsChanging(true);
    try {
      await window.KlleonChat.changeAvatar({ avatar_id: avatarId });
      setCurrentAvatar(avatarId);
    } catch (error) {
      console.error('아바타 변경 실패', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleWakeUp = () => {
    window.KlleonChat.wakeUpAvatar();
    setIsSleeping(false);
  };

  return (
    <div>
      <avatar-container />

      <div>
        <select
          value={currentAvatar}
          onChange={(e) => handleChangeAvatar(e.target.value)}
          disabled={!isReady || isChanging}
        >
          {AVATARS.map((avatar) => (
            <option key={avatar.id} value={avatar.id}>
              {avatar.name}
            </option>
          ))}
        </select>

        <button onClick={() => window.KlleonChat.stopSpeech()}>발화 중지</button>

        {isSleeping && (
          <button onClick={handleWakeUp}>깨우기</button>
        )}
      </div>

      {isChanging && <p>아바타 변경 중...</p>}
    </div>
  );
}
```

## 관련 API

- [init()](/docs/api/init) - SDK 초기화
- [reconnect()](/docs/api/lifecycle#reconnect) - 재연결
- [onStatusEvent()](/docs/api/events#onstatusevent) - 상태 이벤트 구독
