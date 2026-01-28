---
sidebar_position: 4
---

# STT (Speech-to-Text)

음성 인식(STT)과 관련된 메서드입니다. 사용자의 음성을 텍스트로 변환하여 아바타에게 전송합니다.

## startStt()

음성 인식을 시작합니다.

### 시그니처

```typescript
startStt(): void
```

### 사용법

```javascript
const { startStt } = KlleonChat;

// 음성 인식 시작
startStt();
```

### 동작

1. 마이크 입력을 활성화합니다.
2. 사용자 음성을 서버로 전송합니다.
3. `USER_SPEECH_STARTED` 채팅 이벤트가 발생합니다.

### 주의사항

:::warning 마이크 권한
음성 인식을 사용하려면 HTTPS 환경과 마이크 권한이 필요합니다. `init()` 시 `enable_microphone: true`(기본값)로 설정되어 있어야 합니다.
:::

---

## endStt()

음성 인식을 종료하고 인식된 텍스트를 아바타에게 전송합니다.

### 시그니처

```typescript
endStt(): void
```

### 사용법

```javascript
const { endStt } = KlleonChat;

// 음성 인식 종료 및 전송
endStt();
```

### 동작

1. 음성 인식을 종료합니다.
2. 인식된 텍스트를 아바타에게 전송합니다.
3. `USER_SPEECH_STOPPED` 채팅 이벤트가 발생합니다.
4. 인식 결과는 `STT_RESULT` 타입의 채팅 이벤트로 수신됩니다.

---

## cancelStt()

진행 중인 음성 인식을 취소합니다.

### 시그니처

```typescript
cancelStt(): void
```

### 사용법

```javascript
const { cancelStt } = KlleonChat;

// 음성 인식 취소
cancelStt();
```

### 동작

인식된 텍스트를 전송하지 않고 음성 인식을 취소합니다. 사용자가 음성 입력을 중단하고 싶을 때 사용합니다.

---

## STT 이벤트 흐름

```
startStt() 호출
    ↓
USER_SPEECH_STARTED (채팅 이벤트)
    ↓
사용자 음성 입력...
    ↓
endStt() 호출
    ↓
USER_SPEECH_STOPPED (채팅 이벤트)
    ↓
STT_RESULT (인식된 텍스트)
    ↓
아바타 응답
```

## 전체 예제

### HTML

```html
<avatar-container></avatar-container>

<div>
  <button id="sttBtn">음성 입력</button>
  <span id="sttStatus"></span>
</div>

<script>
  const { init, onStatusEvent, onChatEvent, startStt, endStt, cancelStt } = KlleonChat;

  let isReady = false;
  let isRecording = false;
  const sttBtn = document.getElementById('sttBtn');
  const sttStatus = document.getElementById('sttStatus');

  onStatusEvent((status) => {
    if (status === 'VIDEO_CAN_PLAY') {
      isReady = true;
    }
  });

  onChatEvent((data) => {
    switch (data.chat_type) {
      case 'USER_SPEECH_STARTED':
        sttStatus.textContent = '듣는 중...';
        break;
      case 'USER_SPEECH_STOPPED':
        sttStatus.textContent = '처리 중...';
        break;
      case 'STT_RESULT':
        sttStatus.textContent = `인식: ${data.message}`;
        break;
      case 'STT_ERROR':
        sttStatus.textContent = '음성 인식 실패';
        break;
    }
  });

  init({
    sdk_key: 'YOUR_SDK_KEY',
    avatar_id: 'YOUR_AVATAR_ID',
    enable_microphone: true,
  });

  sttBtn.addEventListener('mousedown', () => {
    if (!isReady) return;
    isRecording = true;
    startStt();
    sttBtn.textContent = '누르고 있으면 녹음';
  });

  sttBtn.addEventListener('mouseup', () => {
    if (!isReady || !isRecording) return;
    isRecording = false;
    endStt();
    sttBtn.textContent = '음성 입력';
  });

  // ESC 키로 취소
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isRecording) {
      isRecording = false;
      cancelStt();
      sttBtn.textContent = '음성 입력';
      sttStatus.textContent = '취소됨';
    }
  });
</script>
```

### React

```tsx
import { useState, useEffect, useCallback } from 'react';

function VoiceInput() {
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const { init, destroy, onStatusEvent, onChatEvent } = window.KlleonChat;

    onStatusEvent((sdkStatus) => {
      if (sdkStatus === 'VIDEO_CAN_PLAY') {
        setIsReady(true);
      }
    });

    onChatEvent((data) => {
      switch (data.chat_type) {
        case 'USER_SPEECH_STARTED':
          setStatus('듣는 중...');
          break;
        case 'USER_SPEECH_STOPPED':
          setStatus('처리 중...');
          break;
        case 'STT_RESULT':
          setStatus(`인식: ${data.message}`);
          break;
        case 'STT_ERROR':
          setStatus('음성 인식 실패');
          break;
      }
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
      enable_microphone: true,
    });

    return () => destroy();
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!isReady) return;
    setIsRecording(true);
    window.KlleonChat.startStt();
  }, [isReady]);

  const handleMouseUp = useCallback(() => {
    if (!isReady || !isRecording) return;
    setIsRecording(false);
    window.KlleonChat.endStt();
  }, [isReady, isRecording]);

  const handleCancel = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      window.KlleonChat.cancelStt();
      setStatus('취소됨');
    }
  }, [isRecording]);

  // ESC 키로 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancel]);

  return (
    <div>
      <avatar-container />

      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={!isReady}
      >
        {isRecording ? '녹음 중...' : '음성 입력 (길게 누르기)'}
      </button>

      <p>{status}</p>
    </div>
  );
}
```

## 관련 이벤트

| 이벤트 타입 | 설명 |
|-------------|------|
| `ACTIVATE_VOICE` | 음성 인식 활성화 |
| `USER_SPEECH_STARTED` | 사용자 음성 인식 시작 |
| `USER_SPEECH_STOPPED` | 사용자 음성 인식 종료 |
| `STT_RESULT` | 음성 인식 결과 |
| `STT_ERROR` | 음성 인식 오류 |

## 관련 API

- [sendTextMessage()](/docs/api/messaging#sendtextmessage) - 텍스트 메시지 전송
- [startAudioEcho()](/docs/api/audio-echo) - 오디오 발화
- [onChatEvent()](/docs/api/events#onchatevent) - 채팅 이벤트 구독
