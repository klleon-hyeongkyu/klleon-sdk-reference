# Klleon Chat SDK 이벤트 처리

## 개요

Klleon Chat SDK는 실시간 상태 변화와 데이터를 애플리케이션에 전달하기 위해 커스텀 이벤트를 사용합니다.

---

## 이벤트 리스너 등록

### KlleonChat.onChatEvent(callback)

채팅 메시지 발생 시 호출되는 콜백을 등록합니다. SDK에서 제공하는 `<chat-container>` UI 컴포넌트를 사용하지 않고도, 수신되는 `ChatData`를 기반으로 애플리케이션에 맞는 자체적인 채팅 인터페이스를 구현할 수 있습니다.

**매개변수:**
- `callback` (`(data: ChatData) => void`, 필수): ChatData 객체를 인자로 받는 함수

**코드 예제:**

```javascript
function handleChatMessage(chatData) {
  console.log("새 채팅 메시지:", chatData);
}

window.KlleonChat.onChatEvent(handleChatMessage);
```

### ChatData 객체 속성

| 속성명 | 타입 | 설명 |
|--------|------|------|
| message | string | 수신된 메시지 내용 |
| chat_type | string (ResponseChatType) | 메시지 종류 |
| time | string | 메시지 발생 시간 (ISO 8601 형식) |
| id | string | 메시지 고유 식별자 |

### ResponseChatType 값

| 값 | 설명 |
|----|------|
| TEXT | 아바타가 전송하는 텍스트 메시지. `KlleonChat.echo()` 또는 `KlleonChat.sendTextMessage()` 메서드 사용 후 아바타의 응답으로 발생 |
| STT_RESULT | 사용자 음성이 성공적으로 텍스트로 변환된 결과 |
| STT_ERROR | 사용자 음성 변환 또는 전송 실패 |
| WAIT | 채팅 시작 대기 중 |
| WARN_SUSPENDED | 일정 시간(예: 10초) 동안 채팅이 없을 경우 곧 채팅이 중지될 것을 경고 |
| DISABLED_TIME_OUT | 장시간 채팅 없음으로 인한 세션 중지 |
| TEXT_ERROR | 사용자 텍스트 메시지 전송 실패 |
| TEXT_MODERATION | 부적절한 언어로 인한 메시지 필터링 |
| ERROR | 서버 측 일반 오류 |
| PREPARING_RESPONSE | 아바타가 사용자의 메시지에 대한 답변을 준비 중일 때 발생 |
| RESPONSE_IS_ENDED | 아바타의 한 턴(LLM이 생성한 여러 문장을 포함할 수 있는 응답)이 완전히 종료되었음을 알림 |
| RESPONSE_OK | 아바타가 정상적으로 응답을 준비하거나 발화 시작 |
| WORKER_DISCONNECTED | 아바타 스트리밍 워커 연결 끊김 |
| EXCEED_CONCURRENT_QUOTA | 최대 동시 접속자 수 초과 |
| START_LONG_WAIT | 지정된 시간 동안 사용자와의 상호작용이 없어 아바타가 긴 대기 상태로 전환될 때 발생 |
| USER_SPEECH_STARTED | SDK가 사용자 음성 입력 감지 시작 |
| USER_SPEECH_STOPPED | SDK가 사용자 음성 입력 중지 감지 |

---

### KlleonChat.onStatusEvent(callback)

SDK 및 아바타의 주요 상태 변경 시 호출되는 콜백을 등록합니다.

**매개변수:**
- `callback` (`(status: Status) => void`, 필수): 현재 상태를 나타내는 Status 문자열을 인자로 받는 함수

**코드 예제:**

```javascript
function handleSdkStatus(currentStatus) {
  console.log("SDK 상태 변경:", currentStatus);
  if (currentStatus === "VIDEO_CAN_PLAY") {
    console.log("아바타 영상 재생 준비 완료! 이제 다른 SDK 메서드를 사용할 수 있습니다.");
  }
}

window.KlleonChat.onStatusEvent(handleSdkStatus);
```

### SDK 메서드 사용 전제 조건

대부분의 SDK 메서드 (예: 메시지 전송, STT 기능 등)는 아바타와 정상적으로 연결되어 영상 재생이 가능한 상태(`VIDEO_CAN_PLAY`)일 때 호출해야 합니다. `KlleonChat.init()`과 이벤트 리스너는 이 제약에서 제외됩니다.

### Status 값 상세

| Status 값 | 설명 |
|-----------|------|
| IDLE | SDK 초기화되었으나 아직 미연결 상태 |
| CONNECTING | sdk_key와 avatar_id 검증 통과 상태 |
| CONNECTING_FAILED | 검증 실패 상태 |
| SOCKET_CONNECTED | 웹소켓 서버 연결 완료 |
| SOCKET_FAILED | 웹소켓 서버 연결 실패 |
| STREAMING_CONNECTED | WebRTC 미디어 스트리밍 연결 완료 |
| STREAMING_FAILED | WebRTC 연결 실패 |
| CONNECTED_FINISH | 모든 연결(웹소켓, 스트리밍) 완료 |
| VIDEO_LOAD | 아바타 비디오 데이터 로드 시작 |
| VIDEO_CAN_PLAY | 아바타 비디오 재생이 가능하며, 대부분의 SDK 메서드를 호출할 수 있는 준비 상태 |

---

## 콜백 재등록

`onChatEvent`, `onStatusEvent`를 동일한 이벤트 타입에 대해 여러 번 호출하면, 마지막으로 등록된 콜백 함수만 활성화됩니다. 명시적인 `off` 메서드는 제공되지 않습니다.
