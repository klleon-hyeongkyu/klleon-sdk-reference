# Klleon Chat SDK 메서드

## SDK 라이프사이클

### KlleonChat.init(options)

SDK 초기화 메서드로, 애플리케이션 로드 시 한 번 호출합니다.

**주요 파라미터:**

| 파라미터 | 필수 | 기본값 | 설명 |
|---------|------|--------|------|
| sdk_key | O | - | 클레온 스튜디오 발급 키 |
| avatar_id | O | - | 사용할 아바타의 고유 ID |
| subtitle_code | X | ko_kr | 자막 언어 |
| voice_code | X | ko_kr | 음성 언어 |
| voice_tts_speech_speed | X | 1.0 | 발화 속도 0.5~2.0 |
| enable_microphone | X | true | 마이크 권한 |
| log_level | X | debug | 로그 수준 |
| mode | X | prod | 환경 모드 (prod, dev, stg, demo) |
| custom_id | X | - | 사용자 식별자 |
| user_key | X | - | End-User API 키 |

### KlleonChat.destroy()

SDK가 사용하던 모든 리소스(소켓 연결, WebRTC 연결, 이벤트 리스너 등)를 정리하고 SDK를 완전히 종료합니다.

---

## 메시지 전송

### KlleonChat.sendTextMessage(text)

텍스트 메시지를 아바타에게 전송합니다.

```javascript
KlleonChat.sendTextMessage("안녕하세요!");
```

---

## 음성 입력 (STT)

### KlleonChat.startStt()

마이크를 통한 음성 입력을 시작합니다.

### KlleonChat.endStt()

음성 입력을 종료합니다. 음성은 텍스트로 변환되어 아바타에게 전송됩니다.

### KlleonChat.cancelStt()

진행 중인 음성 입력을 취소합니다.

---

## 아바타 발화 제어

### KlleonChat.stopSpeech()

현재 아바타의 음성(TTS) 출력을 즉시 중단합니다.

---

## 에코 기능

### KlleonChat.echo(text)

제공된 텍스트를 아바타가 그대로 발화합니다.

```javascript
KlleonChat.echo("이 문장을 아바타가 말합니다.");
```

### KlleonChat.startAudioEcho(audio)

Base64 인코딩된 오디오를 아바타가 발화하도록 요청합니다. (0.1MB 제한)

### KlleonChat.endAudioEcho()

오디오 에코를 종료합니다.

---

## 아바타 변경

### KlleonChat.changeAvatar(option)

새로운 아바타와 새 세션을 시작합니다.

```javascript
KlleonChat.changeAvatar({
  avatar_id: "NEW_AVATAR_ID"
});
```

**파라미터:**

| 파라미터 | 필수 | 기본값 | 설명 |
|---------|------|--------|------|
| avatar_id | O | - | 변경할 아바타 ID |
| subtitle_code | X | ko_kr | 자막 언어 |
| voice_code | X | ko_kr | 음성 언어 |
| voice_tts_speech_speed | X | 1.0 | 발화 속도 |

---

## 메시지 목록 관리

### KlleonChat.clearMessageList()

클라이언트 측 UI 메시지 배열을 초기화합니다. 서버 로그는 삭제하지 않습니다.

```javascript
KlleonChat.clearMessageList();
```
