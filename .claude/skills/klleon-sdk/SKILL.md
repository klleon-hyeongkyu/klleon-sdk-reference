---
name: Klleon SDK Integration
description: This skill should be used when the user asks to "integrate Klleon SDK", "add Klleon Chat", "setup avatar SDK", "Klleon SDK 연동", "아바타 SDK 설정", "클레온 SDK 추가", or wants to embed Klleon Chat avatar functionality into their project.
version: 1.0.0
---

# Klleon Chat SDK 통합 가이드

이 스킬은 Klleon Chat SDK를 프로젝트에 통합하는 것을 도와줍니다.

---

## ⚠️ 중요: 필수 질문 단계

**아래 3가지 질문을 반드시 순서대로 진행해야 합니다. 질문 없이 코드 작성을 시작하지 마세요.**

1. SDK 버전 선택
2. 프로젝트 타입 선택
3. 필수 값(sdk_key, avatar_id) 확인

---

## 1. 버전 선택 (필수)

**코드 작성 전에 반드시 AskUserQuestion 도구로 질문하세요:**

**질문**: "어떤 SDK 버전을 사용하시겠습니까?"
- **1.2.0**: 안정적인 버전 (기본 기능)
- **1.3.0 (권장)**: 최신 버전 (향상된 에러 처리, wakeUpAvatar 등 추가 기능)

## 2. 프로젝트 타입 선택 (필수)

**버전 선택 후 반드시 AskUserQuestion 도구로 질문하세요:**

**질문**: "프로젝트 타입이 무엇인가요?"
- **React**: React SPA 프로젝트
- **Next.js**: Next.js SSR/SSG 프로젝트
- **Vanilla JS**: 순수 JavaScript 프로젝트

## 3. 필수 값 확인 (필수)

**프로젝트 타입 선택 후 반드시 AskUserQuestion 도구로 질문하세요:**

**질문**: "SDK 키와 아바타 ID가 있으신가요?"
- **있음**: 값을 알려주세요
- **없음**: 발급 방법을 안내해드릴게요

### 필수 값이 없는 경우

다음 안내를 제공합니다:

1. **클레온 스튜디오 가입**: https://www.studio.klleon.io/
2. **도메인 등록**: SDK 관리 메뉴에서 웹사이트 도메인 등록
3. **SDK 키 발급**: 도메인 등록 후 `sdk_key` 획득
4. **아바타 ID 확인**: 아바타 목록에서 사용할 아바타의 ID 복사

> 필수 값이 준비되면 다시 "SDK 연동해줘"라고 말씀해주세요.

### 필수 값이 있는 경우

환경변수 설정을 안내합니다:

```env
# .env.local (Next.js) 또는 .env (React)
NEXT_PUBLIC_SDK_KEY=your_sdk_key
NEXT_PUBLIC_AVATAR_ID=your_avatar_id
```

또는 사용자가 직접 코드에 값을 넣을 수 있도록 안내합니다.

## 4. 버전별 주요 차이점

| 기능 | 1.2.0 | 1.3.0 |
|------|-------|-------|
| onErrorEvent | ❌ | ✅ |
| ErrorCode enum | ❌ | ✅ |
| wakeUpAvatar | ❌ | ✅ |
| DESTROYED status | ❌ | ✅ |
| RATE_LIMIT 에러 | ❌ | ✅ |
| HANDOVER_* 이벤트 | ❌ | ✅ |

## 5. 문서 참조 가이드

사용자 선택에 따라 적절한 문서를 참조합니다:

| 선택 조합 | 참조 문서 |
|----------|----------|
| 1.2.0 + React/Next.js | `@references/v1.2.0/09-embedding-guide.md` |
| 1.2.0 + Vanilla JS | `@references/v1.2.0/07-examples-vanilla-js.md` |
| 1.3.0 + React/Next.js | `@references/v1.3.0/09-embedding-guide.md` |
| 1.3.0 + Vanilla JS | `@references/v1.3.0/07-examples-vanilla-js.md` |

**추가 참조 문서:**
- SDK 메서드: `@references/v{version}/04-usage-sdk-method.md`
- SDK 이벤트: `@references/v{version}/05-usage-sdk-event.md`
- TypeScript 지원: `@references/v{version}/06-guides-typescript-support.md`
- UI 컴포넌트: `@references/v{version}/03-usage-ui-components.md`

## 6. 통합 단계 안내

### React/Next.js 프로젝트

1. **스크립트 로드 설정**
   - Next.js: `next/script` 사용
   - React: `useEffect` 또는 `react-helmet` 사용

2. **TypeScript 타입 정의**
   - `types/klleon.d.ts` 파일 생성
   - 글로벌 `window.klleonChat` 타입 선언

3. **SDK 훅 생성**
   - `useKlleonChat.ts` 커스텀 훅 작성
   - 초기화, 이벤트 구독, 정리 로직 포함

4. **컴포넌트 구현**
   - 아바타 컴포넌트 래퍼 생성
   - 이벤트 핸들링 통합

### Vanilla JS 프로젝트

1. **HTML에 스크립트 태그 추가**
   ```html
   <script src="https://sdk.klleon.io/{version}/klleon-chat.umd.js"></script>
   ```

2. **초기화 코드 작성**
   ```javascript
   window.klleonChat.init({
     // 설정 옵션
   });
   ```

3. **이벤트 리스너 등록**
   - onChatEvent, onStatusEvent 등 구독

## 7. 일반적인 이슈 해결

- **스크립트 로드 타이밍**: SDK 스크립트가 로드된 후 초기화해야 함
- **SSR 호환성**: Next.js에서 `use client` 지시문 또는 동적 import 사용
- **타입 에러**: `window.klleonChat`에 대한 타입 정의 필요

## 8. 체크리스트

통합 완료 전 확인사항:
- [ ] SDK 스크립트 로드 확인
- [ ] 초기화 호출 및 성공 확인
- [ ] 이벤트 구독 설정
- [ ] 에러 핸들링 구현
- [ ] TypeScript 타입 정의 (TS 프로젝트)
- [ ] 정리(cleanup) 로직 구현
