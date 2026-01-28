---
sidebar_position: 100
---

# 변경 로그

버전별 변경 사항을 안내합니다.

## v1.3.0

**최신 버전**

### 새로운 기능

- `reconnect()` 메서드 추가 - 연결 끊김 시 재연결 지원
- `wakeUpAvatar()` 메서드 추가 - 대기 상태의 아바타 활성화
- `<avatar-container>` 볼륨 조절 기능 (`volume` 속성)
- 새로운 이벤트 타입 추가:
  - `USER_SPEECH_STARTED` - 사용자 음성 인식 시작
  - `USER_SPEECH_STOPPED` - 사용자 음성 인식 종료
  - `START_LONG_WAIT` - 대기 상태 진입

### 개선 사항

- 연결 안정성 향상
- 에러 메시지 개선
- 로그 출력 최적화

---

## v1.2.0

### 새로운 기능

- `startAudioEcho()` / `endAudioEcho()` 메서드 추가 - Base64 오디오 발화 지원
- `clearMessageList()` 메서드 추가 - 메시지 목록 초기화
- `custom_id`, `user_key` 옵션 추가 - 세션 식별자 지원

### 개선 사항

- TTS 발화 속도 조절 범위 확장 (0.5 ~ 2.0)
- 다국어 지원 추가 (일본어, 인도네시아어)

---

## v1.1.0

### 새로운 기능

- `changeAvatar()` 메서드 추가 - 런타임 아바타 변경 지원
- `stopSpeech()` 메서드 추가 - 아바타 발화 중지
- `<chat-container>` 컴포넌트 추가

### 개선 사항

- STT 정확도 향상
- 연결 속도 개선

---

## v1.0.0

**초기 릴리스**

### 핵심 기능

- `init()` / `destroy()` - SDK 생명주기 관리
- `sendTextMessage()` - 텍스트 메시지 전송
- `echo()` - 텍스트 직접 발화
- `startStt()` / `endStt()` / `cancelStt()` - 음성 인식
- `onChatEvent()` / `onStatusEvent()` / `onErrorEvent()` - 이벤트 구독
- `<avatar-container>` 웹 컴포넌트

### 지원 언어

- 한국어 (`ko_kr`)
- 영어 (`en_us`)

---

## 마이그레이션 가이드

### v1.2.x → v1.3.0

v1.3.0은 하위 호환성을 유지합니다. 새로운 기능을 사용하려면:

```javascript
const { reconnect, onErrorEvent } = KlleonChat;

// 재연결 기능 사용
onErrorEvent((error) => {
  if (error.code.includes('DISCONNECTED')) {
    reconnect();
  }
});

// 볼륨 조절
const avatar = document.querySelector('avatar-container');
avatar.setAttribute('volume', '0.5');
```

### v1.1.x → v1.2.0

```javascript
const { startAudioEcho, endAudioEcho, clearMessageList } = KlleonChat;

// 오디오 에코 기능 사용
startAudioEcho(base64AudioData);

// 메시지 목록 초기화
clearMessageList();
```

### v1.0.x → v1.1.0

```javascript
const { changeAvatar, stopSpeech } = KlleonChat;

// 아바타 변경 기능 사용
await changeAvatar({
  avatar_id: 'NEW_AVATAR_ID',
  voice_code: 'en_us',
});

// 발화 중지
stopSpeech();
```
