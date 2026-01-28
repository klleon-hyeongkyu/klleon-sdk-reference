# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klleon Chat SDK (js-sdk v1.3.0)의 공식 API 레퍼런스 문서 사이트입니다.

- **프레임워크**: Docusaurus 3.7
- **언어**: 한국어 (단일 언어)
- **대상 SDK**: `/Users/ravi/Desktop/DEV/Klleon/klleon-sdk/apps/js-sdk/`
- **특징**: 아바타 데모 없음 (public repo 키 노출 방지)

## Project History

### 생성 배경 (2025-01)

1. **목적**: Klleon Chat SDK의 공식 API 레퍼런스 문서 제공
2. **벤치마킹**: 토스페이먼츠 개발자 문서 스타일
   - llms.txt 형식: `- [제목](URL): 설명문`
   - 코드 예제: HTML/JS, React 모두 제공
   - context7 연동 지원

3. **주요 결정사항**:
   - CDN 전용 SDK (npm 패키지 아님) - `window.KlleonChat` 전역 객체 사용
   - js-sdk 1.3.0 기준 문서화 (camera 기능 미포함)
   - 모든 예제에서 `const { ... } = KlleonChat` 또는 `window.KlleonChat` 사용

4. **검증 완료 항목**:
   - API 메서드 17개 + 컴포넌트 2개
   - InitOption 10개 필드 (enable_camera, camera_config 제외)
   - ResponseChatType 23개 (HANDOVER_* 포함)
   - ErrorCode 6개
   - Status 11개

## Commands

```bash
# 개발 서버
npm run start

# 프로덕션 빌드
npm run build

# 빌드 결과 서빙
npm run serve

# 타입 체크
npm run typecheck
```

## Project Structure

```
klleon-sdk-reference/
├── docs/
│   ├── intro.md                 # SDK 소개
│   ├── getting-started.md       # 빠른 시작 가이드
│   ├── api/
│   │   ├── init.md              # init() - 초기화
│   │   ├── lifecycle.md         # destroy(), reconnect()
│   │   ├── messaging.md         # sendTextMessage(), echo(), clearMessageList()
│   │   ├── stt.md               # startStt(), endStt(), cancelStt()
│   │   ├── audio-echo.md        # startAudioEcho(), endAudioEcho()
│   │   ├── avatar-control.md    # changeAvatar(), stopSpeech(), wakeUpAvatar()
│   │   └── events.md            # onChatEvent(), onStatusEvent(), onErrorEvent()
│   ├── components/
│   │   ├── avatar-container.md  # <avatar-container> 웹 컴포넌트
│   │   └── chat-container.md    # <chat-container> 웹 컴포넌트
│   ├── guides/
│   │   ├── typescript.md        # TypeScript 타입 정의
│   │   └── error-handling.md    # 에러 코드 및 처리
│   └── changelog.md             # 변경 로그
├── static/
│   └── llms.txt                 # LLM 문서 인덱스 (Context7 연동)
├── context7.json                # Context7 설정
├── docusaurus.config.ts         # Docusaurus 설정
├── sidebars.ts                  # 사이드바 구조
└── src/
    └── pages/
        └── index.tsx            # 홈페이지 (docs로 리다이렉트)
```

## Documentation Guidelines

### SDK 참조 소스 경로

문서 내용 검증 시 참조할 SDK 소스 파일:

```
/Users/ravi/Desktop/DEV/Klleon/klleon-sdk/apps/js-sdk/src/
├── index.ts                     # export된 메서드 목록
├── core/
│   ├── sdk.ts                   # KlleonSDK 클래스
│   ├── sdkLifecycle.ts          # init(), destroy() 구현
│   ├── sdkMethod.ts             # 메서드 구현
│   └── sdkEvent.ts              # 이벤트 핸들러
├── constants/
│   ├── klleonSDK.ts             # 타입 정의
│   └── error.ts                 # ErrorCode enum
└── ui/
    ├── avatar/avatar.ts         # <avatar-container> (volume 0-100)
    └── chat/chat.ts             # <chat-container> (delay, type, isShowCount)

/Users/ravi/Desktop/DEV/Klleon/klleon-sdk/packages/constants/
└── sdk.interface.ts             # Base 타입 정의
```

### 문서 작성 규칙

1. **코드 예제 형식**:
   - HTML/JavaScript 예제와 React 예제 모두 제공
   - CDN SDK이므로 `window.KlleonChat` 또는 `KlleonChat` 전역 객체 사용
   - `import` 문 사용 금지 (npm 패키지 아님)

2. **SDK 버전**:
   - CDN URL: `https://chat.klleon.io/1.3.0/klleon-chat.umd.js`
   - js-sdk v1.3.0 기준

3. **타입 정의**:
   - InitOption: sdk_key, avatar_id, voice_code, subtitle_code, voice_tts_speech_speed, enable_microphone, log_level, mode, custom_id, user_key
   - ChangeAvatar: avatar_id, voice_code, subtitle_code, voice_tts_speech_speed
   - **주의**: enable_camera, camera_config는 js-sdk에서 사용하지 않음

4. **기본값**:
   - log_level: `"debug"` (소스 코드 기준)
   - voice_code, subtitle_code: `"ko_kr"`
   - voice_tts_speech_speed: `1.0`
   - enable_microphone: `true`
   - mode: `"prod"`

### Context7 연동

- `context7.json`: 라이브러리 설정
- `static/llms.txt`: LLM용 문서 인덱스
- GitHub push 후 context7.com에서 라이브러리 등록 필요

## Important Notes

### js-sdk vs Base 인터페이스 차이

`packages/constants/sdk.interface.ts`에는 다음이 정의되어 있지만 js-sdk에서는 사용하지 않음:
- `enable_camera`, `camera_config` 옵션
- `enableCamera()`, `disableCamera()` 메서드

문서는 js-sdk의 **실제 구현**만 반영해야 함.

### 문서 수정 시 검증 절차

1. SDK 소스 코드 확인 (위 경로 참조)
2. `index.ts`의 export 목록 확인
3. 실제 구현 파일에서 사용되는 옵션/파라미터 확인
4. 문서 수정 후 빌드 테스트 (`npm run build`)
