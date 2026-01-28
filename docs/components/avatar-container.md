---
sidebar_position: 1
---

# avatar-container

아바타 비디오를 표시하는 웹 컴포넌트입니다.

## 기본 사용법

```html
<avatar-container></avatar-container>
```

SDK를 로드하면 `<avatar-container>` 커스텀 엘리먼트가 자동으로 등록됩니다.

## 속성

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `volume` | `number` | `100` | 아바타 음성 볼륨 (0 ~ 100) |

## 스타일링

`<avatar-container>`는 블록 레벨 요소로 동작하며, CSS로 크기와 스타일을 지정할 수 있습니다.

### 기본 스타일

```css
avatar-container {
  display: block;
  width: 400px;
  height: 600px;
}
```

### 반응형 스타일

```css
avatar-container {
  display: block;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 2/3;
}

@media (max-width: 768px) {
  avatar-container {
    max-width: 100%;
    height: auto;
  }
}
```

### 배경 스타일

```css
avatar-container {
  display: block;
  width: 400px;
  height: 600px;
  background-color: #f0f0f0;
  border-radius: 16px;
  overflow: hidden;
}
```

## 볼륨 조절

`volume` 속성으로 아바타 음성 볼륨을 조절할 수 있습니다. 값의 범위는 0~100입니다.

### HTML

```html
<avatar-container volume="50"></avatar-container>

<input type="range" id="volumeSlider" min="0" max="100" step="10" value="100">

<script>
  const avatar = document.querySelector('avatar-container');
  const slider = document.getElementById('volumeSlider');

  slider.addEventListener('input', (e) => {
    avatar.setAttribute('volume', e.target.value);
  });
</script>
```

### React

`public/index.html`에 SDK 스크립트를 추가한 후 사용합니다:

```tsx
import { useState, useRef, useEffect } from 'react';

function AvatarWithVolume() {
  const [volume, setVolume] = useState(100);
  const avatarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.setAttribute('volume', String(volume));
    }
  }, [volume]);

  return (
    <div>
      <avatar-container ref={avatarRef} />

      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
      <span>볼륨: {volume}%</span>
    </div>
  );
}
```

## 전체 예제

### HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avatar Container Example</title>
  <script src="https://chat.klleon.io/1.3.0/klleon-chat.umd.js"></script>
  <style>
    .avatar-wrapper {
      max-width: 400px;
      margin: 0 auto;
    }

    avatar-container {
      display: block;
      width: 100%;
      aspect-ratio: 2/3;
      background-color: #1a1a2e;
      border-radius: 16px;
      overflow: hidden;
    }

    .controls {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .volume-slider {
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="avatar-wrapper">
    <avatar-container id="avatar"></avatar-container>

    <div class="controls">
      <label for="volume">볼륨:</label>
      <input
        type="range"
        id="volume"
        class="volume-slider"
        min="0"
        max="100"
        step="10"
        value="100"
      >
      <span id="volumeValue">100%</span>
    </div>
  </div>

  <script>
    const { init, onStatusEvent } = KlleonChat;
    const avatar = document.getElementById('avatar');
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volumeValue');

    volumeSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      avatar.setAttribute('volume', value);
      volumeValue.textContent = `${value}%`;
    });

    onStatusEvent((status) => {
      console.log('상태:', status);
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });
  </script>
</body>
</html>
```

### React

```tsx
import { useEffect, useState, useRef } from 'react';

function AvatarPage() {
  const [status, setStatus] = useState('IDLE');
  const [volume, setVolume] = useState(100);
  const avatarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const { init, destroy, onStatusEvent } = window.KlleonChat;

    onStatusEvent((newStatus) => {
      setStatus(newStatus);
    });

    init({
      sdk_key: 'YOUR_SDK_KEY',
      avatar_id: 'YOUR_AVATAR_ID',
    });

    return () => destroy();
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

    if (avatarRef.current) {
      avatarRef.current.setAttribute('volume', String(newVolume));
    }
  };

  return (
    <div className="avatar-wrapper">
      <avatar-container
        ref={avatarRef}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '2/3',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      />

      <div className="controls">
        <label>볼륨:</label>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={volume}
          onChange={handleVolumeChange}
        />
        <span>{volume}%</span>
      </div>

      <p>상태: {status}</p>
    </div>
  );
}

export default AvatarPage;
```

## TypeScript 타입

TypeScript 프로젝트에서 `<avatar-container>`를 사용하려면 타입을 선언해야 합니다.

```typescript
// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'avatar-container': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        volume?: number | string;
      },
      HTMLElement
    >;
  }
}
```

## 관련 항목

- [chat-container](/docs/components/chat-container) - 채팅 UI 컴포넌트
- [init()](/docs/api/init) - SDK 초기화
- [TypeScript 지원](/docs/guides/typescript) - 타입 정의 가이드
