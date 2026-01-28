---
sidebar_position: 5
---

# Audio Echo

Base64 인코딩된 오디오 데이터를 아바타가 발화하도록 하는 메서드입니다.

## startAudioEcho()

Base64 인코딩된 오디오 데이터를 아바타가 발화합니다.

### 시그니처

```typescript
startAudioEcho(audio: string): void
```

### 매개변수

| 매개변수 | 타입 | 설명 |
|----------|------|------|
| `audio` | `string` | Base64 인코딩된 오디오 데이터 |

### 사용법

```javascript
const { startAudioEcho } = KlleonChat;

// Base64 오디오 데이터 전송
const audioBase64 = 'SGVsbG8gV29ybGQ='; // 예시
startAudioEcho(audioBase64);
```

### 제한사항

:::warning 파일 크기 제한
오디오 데이터는 **100KB (0.1MB)** 이하여야 합니다. 초과 시 전송되지 않습니다.
:::

:::info Base64 형식
유효한 Base64 인코딩 문자열이어야 합니다. 잘못된 형식은 무시됩니다.
:::

### 예제: 파일에서 오디오 전송

```javascript
const { startAudioEcho, endAudioEcho } = KlleonChat;

async function sendAudioFile(file) {
  // 파일 크기 확인 (100KB 제한)
  if (file.size > 100 * 1024) {
    console.error('파일이 너무 큽니다. 100KB 이하여야 합니다.');
    return;
  }

  // 파일을 Base64로 변환
  const reader = new FileReader();

  reader.onload = () => {
    const base64 = reader.result.split(',')[1]; // data:audio/...;base64, 부분 제거
    startAudioEcho(base64);
  };

  reader.readAsDataURL(file);
}

// 파일 입력에서 사용
document.getElementById('audioInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    sendAudioFile(file);
  }
});
```

---

## endAudioEcho()

오디오 에코 세션을 종료합니다.

### 시그니처

```typescript
endAudioEcho(): void
```

### 사용법

```javascript
const { endAudioEcho } = KlleonChat;

// 오디오 에코 종료
endAudioEcho();
```

### 설명

진행 중인 오디오 발화를 종료하거나, 오디오 스트리밍 세션을 명시적으로 닫을 때 사용합니다.

---

## 전체 예제

### HTML

```html
<avatar-container></avatar-container>

<div>
  <input type="file" id="audioInput" accept="audio/*">
  <button id="stopBtn">발화 중지</button>
</div>

<script>
  const { init, onStatusEvent, startAudioEcho, endAudioEcho } = KlleonChat;

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

  // 오디오 파일 업로드 및 전송
  document.getElementById('audioInput').addEventListener('change', (e) => {
    if (!isReady) {
      alert('아바타가 준비되지 않았습니다.');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 확인
    if (file.size > 100 * 1024) {
      alert('파일이 너무 큽니다. 100KB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      startAudioEcho(base64);
    };
    reader.readAsDataURL(file);
  });

  // 발화 중지
  document.getElementById('stopBtn').addEventListener('click', () => {
    endAudioEcho();
  });
</script>
```

### React

```tsx
import { useState, useEffect, useRef } from 'react';

const MAX_FILE_SIZE = 100 * 1024; // 100KB

function AudioEchoPlayer() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');

    const file = e.target.files?.[0];
    if (!file) return;

    if (!isReady) {
      setError('아바타가 준비되지 않았습니다.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('파일이 너무 큽니다. 100KB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      window.KlleonChat.startAudioEcho(base64);
    };
    reader.onerror = () => {
      setError('파일 읽기 실패');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <avatar-container />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <button onClick={() => window.KlleonChat.endAudioEcho()}>발화 중지</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## 사용 시나리오

- 미리 녹음된 오디오 메시지 재생
- 외부 TTS 서비스로 생성된 음성 발화
- 오디오 파일을 아바타 음성으로 변환

## 관련 API

- [echo()](/docs/api/messaging#echo) - 텍스트 직접 발화
- [startStt()](/docs/api/stt#startstt) - 음성 인식 시작
- [stopSpeech()](/docs/api/avatar-control#stopspeech) - 아바타 발화 중지
