# Klleon Chat SDK Vanilla JS 예제

## 개요

이 문서는 Klleon Chat SDK를 바닐라 JavaScript로 구현하는 방법을 설명합니다. 아래 코드를 `index.html` 파일로 저장하고, `{VERSION}`, `YOUR_SDK_KEY`, `YOUR_AVATAR_ID`를 실제 값으로 변경한 후 웹 브라우저에서 실행할 수 있습니다.

## 필수 설정 단계

1. SDK 버전을 실제 버전으로 변경 (예: 1.3.0)
2. `YOUR_SDK_KEY` 교체
3. `YOUR_AVATAR_ID` 교체

## 전체 예제 코드

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klleon Chat SDK - Vanilla JS Example</title>
  <script src="https://web.sdk.klleon.io/{VERSION}/klleon-chat.umd.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .container {
      display: flex;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .avatar-section {
      flex: 2;
    }
    .chat-section {
      flex: 1;
    }
    avatar-container {
      width: 100%;
      height: 480px;
      display: block;
    }
    chat-container {
      width: 100%;
      height: 480px;
      display: block;
    }
    .controls {
      margin-top: 20px;
    }
    .controls input {
      width: 70%;
      padding: 10px;
      font-size: 16px;
    }
    .controls button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="avatar-section">
      <avatar-container id="avatar"></avatar-container>
    </div>
    <div class="chat-section">
      <chat-container id="chat"></chat-container>
    </div>
  </div>

  <div class="controls">
    <input type="text" id="messageInput" placeholder="메시지를 입력하세요">
    <button onclick="sendMessage()">전송</button>
    <button onclick="echoMessage()">에코</button>
  </div>

  <script>
    const { KlleonChat } = window;

    // SDK 상태 이벤트 리스너
    KlleonChat.onStatusEvent((status) => {
      console.log("SDK 상태:", status);
      if (status === "VIDEO_CAN_PLAY") {
        console.log("아바타 영상 재생 준비 완료!");
      }
    });

    // 채팅 이벤트 리스너
    KlleonChat.onChatEvent((chatData) => {
      console.log("채팅 이벤트:", chatData);
    });

    // 에러 이벤트 리스너
    KlleonChat.onErrorEvent((errorData) => {
      console.error("에러 발생:", errorData.code, errorData.message);
    });

    // SDK 초기화
    async function initSDK() {
      try {
        await KlleonChat.init({
          sdk_key: "YOUR_SDK_KEY",
          avatar_id: "YOUR_AVATAR_ID",
          log_level: "debug"
        });
        console.log("SDK 초기화 완료");
      } catch (error) {
        console.error("SDK 초기화 실패:", error);
      }
    }

    // 아바타 컨테이너 설정
    const avatarElement = document.getElementById("avatar");
    avatarElement.videoStyle = {
      borderRadius: "12px",
      objectFit: "cover"
    };
    avatarElement.volume = 100;

    // 채팅 컨테이너 설정
    const chatElement = document.getElementById("chat");
    chatElement.delay = 30;
    chatElement.type = "text";
    chatElement.isShowCount = true;

    // 메시지 전송
    function sendMessage() {
      const input = document.getElementById("messageInput");
      const message = input.value.trim();
      if (message) {
        KlleonChat.sendTextMessage(message);
        input.value = "";
      }
    }

    // 에코 메시지
    function echoMessage() {
      const input = document.getElementById("messageInput");
      const message = input.value.trim();
      if (message) {
        KlleonChat.echo(message);
        input.value = "";
      }
    }

    // Enter 키로 메시지 전송
    document.getElementById("messageInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    // SDK 초기화 실행
    initSDK();

    // 페이지 언로드 시 SDK 정리
    window.addEventListener("beforeunload", () => {
      KlleonChat.destroy();
    });
  </script>
</body>
</html>
```

## 주요 기능

SDK의 상태 변경 및 이벤트는 브라우저 개발자 콘솔에서 확인 가능합니다.

## HTML 구조

페이지는 두 개의 주요 섹션으로 구성됩니다:

- **아바타 섹션**: 아바타 컨테이너 표시 (flex: 2)
- **채팅 제어 섹션**: 채팅 창과 입력 필드 (flex: 1)

## 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `window.KlleonChat.init()` | SDK 초기화 |
| `window.KlleonChat.sendTextMessage()` | 텍스트 메시지 전송 |
| `window.KlleonChat.echo()` | 아바타 발화 |
| `window.KlleonChat.destroy()` | 리소스 정리 |
| `window.KlleonChat.wakeUpAvatar()` | 대기 상태 아바타 깨우기 |

## 이벤트 리스너

| 리스너 | 설명 |
|--------|------|
| `onStatusEvent()` | SDK 상태 변경 모니터링 |
| `onChatEvent()` | 채팅 데이터 이벤트 처리 |
| `onErrorEvent()` | 에러 이벤트 처리 |
