# Klleon Chat SDK 시작하기

## 개요

Klleon Chat SDK를 웹 애플리케이션에 통합하여 아바타 채팅 기능을 추가하는 방법을 단계별로 안내합니다.

## 사전 준비 사항

SDK 사용 전 필요한 준비:

1. **클레온 스튜디오 계정** - https://www.studio.klleon.io/ 에서 가입
2. **도메인 등록** - SDK 관리 메뉴에서 웹사이트 도메인 등록
3. **SDK 키 발급** - 도메인 등록 후 고유한 `sdk_key` 획득
4. **아바타 ID 확인** - 아바타 목록 페이지에서 ID 복사 가능한 아바타만 연동 가능

> 문의: `partnership@klleon.io`

## SDK 설치

HTML의 `<head>` 태그에 스크립트 추가:

```html
<script src="https://web.sdk.klleon.io/{VERSION}/klleon-chat.umd.js"></script>
```

`{VERSION}`을 실제 버전으로 변경 (예: 1.2.0). 최신 버전은 클레온 스튜디오에서 확인.

## SDK 초기화

DOM 준비 후 `window.KlleonChat.init()` 호출:

```javascript
const { KlleonChat } = window;

// 1. Status 이벤트 리스너
KlleonChat.onStatusEvent((status) => {
  if (status === "VIDEO_CAN_PLAY") {
    console.log("아바타 영상 재생 준비 완료!");
  }
});

// 2. Chat 이벤트 리스너
KlleonChat.onChatEvent((chatData) => {
  console.log("SDK Chat Event:", chatData);
});

// 3. 초기화
await KlleonChat.init({
  sdk_key: "YOUR_SDK_KEY",
  avatar_id: "YOUR_AVATAR_ID",
});
```

## 초기화 옵션 (InitOption)

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| sdk_key | string | O | - | 발급받은 SDK 키 |
| avatar_id | string | O | - | 아바타 고유 ID |
| subtitle_code | string | X | ko_kr | 자막 언어 (ko_kr, en_us, ja_jp, id_id) |
| voice_code | string | X | ko_kr | 음성 언어 설정 |
| voice_tts_speech_speed | number | X | 1.0 | 발화 속도 (0.5~2.0) |
| enable_microphone | boolean | X | true | 마이크 기능 활성화 |
| log_level | string | X | debug | 로그 상세도 (debug, info, warn, error, silent) |
| mode | string | X | prod | 환경 모드 (prod, dev, stg, demo) |
| custom_id | string | X | - | 사용자 정의 식별자 |
| user_key | string | X | - | End-User API 발급 키 |

> **프로덕션 배포 시** 로그 수준을 `silent`로 설정하여 성능을 최적화하고 정보 노출을 방지하세요.

## React 전체 예제

**index.html:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script src="https://web.sdk.klleon.io/1.2.0/klleon-chat.umd.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**App.tsx:**

```typescript
import { useEffect, useRef } from "react";

function App() {
  const avatarRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const { KlleonChat } = window;

    const init = async () => {
      KlleonChat.onStatusEvent((status) => {
        if (status === "VIDEO_CAN_PLAY") {
          console.log("아바타 영상 재생 준비 완료!");
        }
      });

      KlleonChat.onChatEvent((chatData) => {
        console.log("SDK Chat Event:", chatData);
      });

      await KlleonChat.init({
        sdk_key: "YOUR_SDK_KEY",
        avatar_id: "YOUR_AVATAR_ID",
      });
    };

    init();

    if (avatarRef.current) {
      avatarRef.current.videoStyle = {
        borderRadius: "30px",
        objectFit: "cover",
      };
      avatarRef.current.volume = 100;
    }

    if (chatRef.current) {
      chatRef.current.delay = 30;
      chatRef.current.type = "text";
      chatRef.current.isShowCount = true;
    }

    return () => {
      KlleonChat.destroy();
    };
  }, []);

  return (
    <div style={{ display: "flex", width: "600px", height: "720px", gap: "24px" }}>
      <avatar-container ref={avatarRef} style={{ flex: 1 }}></avatar-container>
      <chat-container ref={chatRef} style={{ flex: 1 }}></chat-container>
    </div>
  );
}

export default App;
```

> **참고:** 실제 동작을 위해 `YOUR_SDK_KEY`와 `YOUR_AVATAR_ID`를 유효한 값으로 교체하세요.
