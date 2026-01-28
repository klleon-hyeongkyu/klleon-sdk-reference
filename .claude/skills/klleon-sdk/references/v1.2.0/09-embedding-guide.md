# Klleon Chat SDK 임베딩 가이드

> 다른 프로젝트에서 Klleon Chat SDK를 빠르게 통합하기 위한 실전 가이드

## 목차

1. [빠른 시작](#빠른-시작)
2. [아키텍처 개요](#아키텍처-개요)
3. [타입 정의](#타입-정의)
4. [SDK 래퍼 훅](#sdk-래퍼-훅)
5. [이벤트 핸들링](#이벤트-핸들링)
6. [전체 구현 예제](#전체-구현-예제)
7. [환경 변수](#환경-변수)
8. [고급 활용](#고급-활용)
9. [브라우저 호환성](#브라우저-호환성)
10. [API 응답 JSON 예시](#api-응답-json-예시)
11. [트러블슈팅](#트러블슈팅)

---

## 빠른 시작

### 1. SDK 스크립트 로드

```html
<!-- index.html 또는 layout에 추가 -->
<script src="https://web.sdk.klleon.io/1.2.0/klleon-chat.umd.js"></script>
```

### 2. 필수 파일 구조

```
your-project/
├── types/
│   └── klleon.d.ts         # 타입 정의
├── hooks/
│   └── useKlleonSdk.ts     # 저수준 SDK 래퍼
└── features/chat/
    └── hooks/
        └── useChatSdk.ts   # 고수준 채팅 훅
```

### 3. 사전 준비

1. **클레온 스튜디오 계정** - https://www.studio.klleon.io/ 가입
2. **도메인 등록** - SDK 관리 메뉴에서 웹사이트 도메인 등록
3. **SDK 키 발급** - 도메인 등록 후 `sdk_key` 획득
4. **아바타 ID 확인** - 아바타 목록에서 ID 복사

---

## 아키텍처 개요

```
window.KlleonChat (외부 스크립트 - UMD 번들)
       ↓
useKlleonSdk (저수준 래퍼)
  - SDK 메서드 래핑
  - ref로 인스턴스 관리
  - 리렌더링 방지
       ↓
useChatSdk (고수준 훅)
  - 이벤트 핸들링 통합
  - 상태 관리 (isLoading, isVideoCanPlay)
  - 비즈니스 로직
       ↓
ChatPage (UI 컴포넌트)
  - avatar-container (아바타 영상)
  - chat-container (채팅 UI) 또는 커스텀 UI
```

### SDK 라이프사이클

```
1. 스크립트 로드 → window.KlleonChat 사용 가능
2. init() 호출 → SDK 초기화 시작
3. 연결 과정: IDLE → CONNECTING → SOCKET_CONNECTED → STREAMING_CONNECTED → VIDEO_CAN_PLAY
4. VIDEO_CAN_PLAY 이후 → SDK 메서드 사용 가능
5. destroy() 호출 → 리소스 정리
```

---

## 타입 정의

### types/klleon.d.ts

```typescript
/**
 * Klleon Chat SDK 타입 정의
 * @version 1.2.0
 */

// ============================================================
// 기본 타입
// ============================================================

/**
 * SDK 연결 상태
 */
export type Status =
  | 'IDLE'                  // 초기 상태 (미연결)
  | 'CONNECTING'            // sdk_key, avatar_id 검증 중
  | 'CONNECTING_FAILED'     // 검증 실패
  | 'SOCKET_CONNECTED'      // WebSocket 연결 완료
  | 'SOCKET_FAILED'         // WebSocket 연결 실패
  | 'STREAMING_CONNECTED'   // WebRTC 스트리밍 연결 완료
  | 'STREAMING_FAILED'      // WebRTC 연결 실패
  | 'CONNECTED_FINISH'      // 모든 연결 완료
  | 'VIDEO_LOAD'            // 비디오 데이터 로딩 시작
  | 'VIDEO_CAN_PLAY';       // 비디오 재생 가능 (SDK 사용 준비 완료)

/**
 * 로그 레벨
 */
export type LogLevelType = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * 음성 언어 코드
 */
export type VoiceCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id';

/**
 * 자막 언어 코드
 */
export type SubtitleCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id';

/**
 * SDK 환경 모드
 */
export type ModeType = 'prod' | 'dev' | 'stg' | 'demo';

// ============================================================
// 채팅 이벤트 타입
// ============================================================

/**
 * 채팅 이벤트 타입 (ResponseChatType)
 */
export enum ResponseChatType {
  // 아바타 메시지
  TEXT = 'TEXT',                             // 아바타 텍스트 응답
  PREPARING_RESPONSE = 'PREPARING_RESPONSE', // 아바타 답변 준비 중
  RESPONSE_IS_ENDED = 'RESPONSE_IS_ENDED',   // 아바타 응답 턴 완료
  RESPONSE_OK = 'RESPONSE_OK',               // 정상적으로 응답 시작

  // 음성 인식 (STT)
  STT_RESULT = 'STT_RESULT',                 // 음성→텍스트 변환 결과
  STT_ERROR = 'STT_ERROR',                   // 음성 변환 실패
  USER_SPEECH_STARTED = 'USER_SPEECH_STARTED', // 사용자 음성 입력 시작 감지
  USER_SPEECH_STOPPED = 'USER_SPEECH_STOPPED', // 사용자 음성 입력 중지 감지

  // 세션 상태
  WAIT = 'WAIT',                             // 대기열 진입 (대기 인원수 포함)
  WARN_SUSPENDED = 'WARN_SUSPENDED',         // 10초 후 세션 중지 경고
  DISABLED_TIME_OUT = 'DISABLED_TIME_OUT',   // 타임아웃으로 세션 중지
  START_LONG_WAIT = 'START_LONG_WAIT',       // 아바타 긴 대기 상태 진입
  WORKER_DISCONNECTED = 'WORKER_DISCONNECTED', // 스트리밍 워커 연결 끊김

  // 에러
  ERROR = 'ERROR',                           // 서버 에러
  TEXT_ERROR = 'TEXT_ERROR',                 // 메시지 전송 실패
  TEXT_MODERATION = 'TEXT_MODERATION',       // 부적절한 언어 필터링
  EXCEED_CONCURRENT_QUOTA = 'EXCEED_CONCURRENT_QUOTA', // 동시 접속자 초과
}

// ============================================================
// 데이터 인터페이스
// ============================================================

/**
 * 채팅 데이터
 */
export interface ChatData {
  /** 메시지 내용 */
  message: string;
  /** 메시지 타입 */
  chat_type: ResponseChatType;
  /** 발생 시간 (ISO 8601) */
  time: string;
  /** 메시지 고유 ID */
  id: string;
}

/**
 * SDK 초기화 옵션
 */
export interface InitOption {
  /** 발급받은 SDK 키 (필수) */
  sdk_key: string;
  /** 아바타 고유 ID (필수) */
  avatar_id: string;
  /** 자막 언어 코드 */
  subtitle_code?: SubtitleCodeType;
  /** 음성 언어 코드 */
  voice_code?: VoiceCodeType;
  /** TTS 발화 속도 (0.5~2.0, 기본값: 1.0) */
  voice_tts_speech_speed?: number;
  /** 마이크 기능 활성화 (기본값: true) */
  enable_microphone?: boolean;
  /** 로그 레벨 (기본값: 'debug') */
  log_level?: LogLevelType;
  /** 환경 모드 (기본값: 'prod') */
  mode?: ModeType;
  /** 사용자 정의 식별자 */
  custom_id?: string;
  /** End-User API 키 */
  user_key?: string;
}

/**
 * 아바타 변경 옵션
 */
export interface ChangeAvatarOption {
  /** 변경할 아바타 ID (필수) */
  avatar_id: string;
  /** 자막 언어 코드 */
  subtitle_code?: SubtitleCodeType;
  /** 음성 언어 코드 */
  voice_code?: VoiceCodeType;
  /** TTS 발화 속도 */
  voice_tts_speech_speed?: number;
}

/**
 * 아바타 컨테이너 속성
 */
export interface AvatarProps {
  /** 비디오 요소 스타일 */
  videoStyle?: React.CSSProperties | null;
  /** 볼륨 (0~100) */
  volume?: number;
}

/**
 * 채팅 컨테이너 속성
 */
export interface ChatProps {
  /** 입력 모드 ('text' | 'voice') */
  type?: 'text' | 'voice';
  /** 타이핑 효과 지연(ms) */
  delay?: number;
  /** 글자 수 카운터 표시 */
  isShowCount?: boolean;
}

// ============================================================
// SDK 인터페이스
// ============================================================

/**
 * Klleon Chat SDK 메인 인터페이스
 */
export interface KlleonChat {
  // 라이프사이클
  /** SDK 초기화 */
  init: (option: InitOption) => Promise<void>;
  /** SDK 종료 및 리소스 정리 */
  destroy: () => void;

  // 이벤트 리스너
  /** 채팅 이벤트 콜백 등록 */
  onChatEvent: (callback: (data: ChatData) => void) => void;
  /** 상태 이벤트 콜백 등록 */
  onStatusEvent: (callback: (status: Status) => void) => void;

  // 메시지
  /** 텍스트 메시지 전송 */
  sendTextMessage: (message: string) => void;
  /** 메시지 목록 초기화 */
  clearMessageList: () => void;

  // 음성 인식 (STT)
  /** 음성 입력 시작 */
  startStt: () => void;
  /** 음성 입력 종료 (텍스트 변환 후 전송) */
  endStt: () => void;
  /** 음성 입력 취소 */
  cancelStt: () => void;

  // 아바타 제어
  /** 아바타 발화 중단 */
  stopSpeech: () => void;
  /** 아바타 변경 (새 세션) */
  changeAvatar: (option: ChangeAvatarOption) => Promise<void>;

  // 에코 기능
  /** 텍스트를 아바타가 그대로 발화 */
  echo: (text: string) => void;
  /** Base64 오디오를 아바타가 발화 (0.1MB 제한) */
  startAudioEcho: (audio: string) => void;
  /** 오디오 에코 종료 */
  endAudioEcho: () => void;
}

// ============================================================
// Window 타입 확장
// ============================================================

declare global {
  interface Window {
    KlleonChat: KlleonChat;
  }
}

export {};
```

---

## SDK 래퍼 훅

### hooks/useKlleonSdk.ts

저수준 SDK 래퍼. ref로 인스턴스를 관리하여 불필요한 리렌더링을 방지합니다.

```typescript
import { useRef, useMemo, useCallback } from 'react';
import type {
  KlleonChat,
  InitOption,
  ChatData,
  ChangeAvatarOption,
  Status,
} from '@/types/klleon';

/**
 * 저수준 SDK 래퍼 훅
 * SDK 메서드를 안전하게 래핑하고 ref로 인스턴스를 관리합니다.
 */
const useKlleonSdk = () => {
  const klleonRef = useRef<KlleonChat | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * SDK 사용 가능 여부 확인
   */
  const isAvailable = useCallback((): boolean => {
    return typeof window !== 'undefined' && !!window.KlleonChat;
  }, []);

  const sdk = useMemo(
    () => ({
      // ==========================================
      // 라이프사이클
      // ==========================================

      /**
       * SDK 초기화
       * @throws SDK 로드 실패 시 에러
       */
      init: async (option: InitOption): Promise<void> => {
        if (!isAvailable()) {
          throw new Error(
            'KlleonChat is not available. SDK 스크립트가 로드되었는지 확인하세요.'
          );
        }

        // 이미 초기화된 경우 먼저 destroy
        if (isInitializedRef.current && klleonRef.current) {
          klleonRef.current.destroy();
        }

        klleonRef.current = window.KlleonChat;
        await window.KlleonChat.init(option);
        isInitializedRef.current = true;
      },

      /**
       * SDK 종료 및 리소스 정리
       */
      destroy: (): void => {
        if (klleonRef.current && isInitializedRef.current) {
          klleonRef.current.destroy();
          klleonRef.current = null;
          isInitializedRef.current = false;
        }
      },

      // ==========================================
      // 이벤트 리스너
      // ==========================================

      /**
       * 채팅 이벤트 콜백 등록
       */
      onChatEvent: (callback: (data: ChatData) => void): void => {
        klleonRef.current?.onChatEvent(callback);
      },

      /**
       * 상태 변경 이벤트 콜백 등록
       */
      onStatusEvent: (callback: (status: Status) => void): void => {
        klleonRef.current?.onStatusEvent(callback);
      },

      // ==========================================
      // 메시지
      // ==========================================

      /**
       * 텍스트 메시지 전송
       */
      sendTextMessage: (message: string): void => {
        klleonRef.current?.sendTextMessage(message);
      },

      /**
       * 메시지 목록 초기화
       */
      clearMessageList: (): void => {
        klleonRef.current?.clearMessageList();
      },

      // ==========================================
      // 음성 인식 (STT)
      // ==========================================

      /**
       * 음성 입력 시작
       */
      startStt: (): void => {
        klleonRef.current?.startStt();
      },

      /**
       * 음성 입력 종료 (변환 후 전송)
       */
      endStt: (): void => {
        klleonRef.current?.endStt();
      },

      /**
       * 음성 입력 취소
       */
      cancelStt: (): void => {
        klleonRef.current?.cancelStt();
      },

      // ==========================================
      // 아바타 제어
      // ==========================================

      /**
       * 아바타 발화 중단
       */
      stopSpeech: (): void => {
        klleonRef.current?.stopSpeech();
      },

      /**
       * 아바타 변경
       */
      changeAvatar: async (option: ChangeAvatarOption): Promise<void> => {
        await klleonRef.current?.changeAvatar(option);
      },

      // ==========================================
      // 에코 기능
      // ==========================================

      /**
       * 텍스트 에코
       */
      echo: (text: string): void => {
        klleonRef.current?.echo(text);
      },

      /**
       * 오디오 에코 시작
       */
      startAudioEcho: (audio: string): void => {
        klleonRef.current?.startAudioEcho(audio);
      },

      /**
       * 오디오 에코 종료
       */
      endAudioEcho: (): void => {
        klleonRef.current?.endAudioEcho();
      },

      // ==========================================
      // 유틸리티
      // ==========================================

      /**
       * SDK 인스턴스 반환
       */
      getInstance: (): KlleonChat | null => klleonRef.current,

      /**
       * SDK 사용 가능 여부
       */
      isAvailable,
    }),
    [isAvailable]
  );

  return { sdk };
};

export default useKlleonSdk;
```

---

## 이벤트 핸들링

### 상태 이벤트 (Status) 흐름

연결 상태 순서:

```
IDLE
  ↓
CONNECTING (sdk_key, avatar_id 검증)
  ↓
SOCKET_CONNECTED (WebSocket 연결)
  ↓
STREAMING_CONNECTED (WebRTC 스트리밍)
  ↓
CONNECTED_FINISH (모든 연결 완료)
  ↓
VIDEO_LOAD (비디오 데이터 로딩)
  ↓
VIDEO_CAN_PLAY (SDK 사용 준비 완료!)
```

```typescript
sdk.onStatusEvent((status) => {
  switch (status) {
    case 'IDLE':
      // 초기 상태
      break;

    case 'CONNECTING':
      // 연결 시작 - 로딩 표시
      setProgress(10);
      break;

    case 'SOCKET_CONNECTED':
      // WebSocket 연결 완료
      setProgress(30);
      break;

    case 'STREAMING_CONNECTED':
      // WebRTC 연결 완료
      setProgress(50);
      break;

    case 'CONNECTED_FINISH':
      // 모든 연결 완료
      setProgress(70);
      break;

    case 'VIDEO_LOAD':
      // 비디오 로딩 시작
      setProgress(90);
      break;

    case 'VIDEO_CAN_PLAY':
      // 🎉 준비 완료! SDK 메서드 사용 가능
      setProgress(100);
      setIsReady(true);
      setIsLoading(false);
      break;

    // 에러 상태
    case 'CONNECTING_FAILED':
      handleError('SDK 키 또는 아바타 ID가 올바르지 않습니다.');
      break;

    case 'SOCKET_FAILED':
      handleError('WebSocket 연결에 실패했습니다.');
      break;

    case 'STREAMING_FAILED':
      handleError('스트리밍 연결에 실패했습니다.');
      break;
  }
});
```

### 채팅 이벤트 (ChatData) 처리

```typescript
import { ResponseChatType } from '@/types/klleon';

sdk.onChatEvent((event) => {
  const { chat_type, message, id, time } = event;

  switch (chat_type) {
    // ========================================
    // 아바타 메시지
    // ========================================

    case ResponseChatType.TEXT:
      // 아바타가 보내는 텍스트 메시지
      addCharacterMessage(message, id);
      break;

    case ResponseChatType.PREPARING_RESPONSE:
      // 아바타가 답변을 준비 중 (타이핑 인디케이터 표시)
      setIsTyping(true);
      break;

    case ResponseChatType.RESPONSE_OK:
      // 아바타가 응답을 시작함
      setIsTyping(false);
      break;

    case ResponseChatType.RESPONSE_IS_ENDED:
      // 아바타의 응답 턴이 완료됨 (여러 문장 포함 가능)
      setIsStreaming(false);
      break;

    // ========================================
    // 음성 인식 (STT)
    // ========================================

    case ResponseChatType.STT_RESULT:
      // 음성→텍스트 변환 결과 (사용자 메시지로 처리)
      addUserMessage(message);
      break;

    case ResponseChatType.STT_ERROR:
      // 음성 인식 실패
      showToast('음성 인식에 실패했습니다. 다시 시도해주세요.');
      break;

    case ResponseChatType.USER_SPEECH_STARTED:
      // 사용자 음성 입력 시작 감지
      setIsListening(true);
      break;

    case ResponseChatType.USER_SPEECH_STOPPED:
      // 사용자 음성 입력 중지 감지
      setIsListening(false);
      break;

    // ========================================
    // 세션 상태
    // ========================================

    case ResponseChatType.WAIT:
      // 대기열 진입 (message에 대기 인원수 포함)
      const waitCount = parseInt(message, 10);
      showWaitingModal(waitCount);
      break;

    case ResponseChatType.WARN_SUSPENDED:
      // 10초 후 세션 중지 경고
      showWarning('장시간 입력이 없어 곧 연결이 종료됩니다.');
      break;

    case ResponseChatType.START_LONG_WAIT:
      // 아바타가 긴 대기 상태로 전환
      setIsAvatarSleeping(true);
      break;

    case ResponseChatType.DISABLED_TIME_OUT:
      // 타임아웃으로 세션 종료
      showModal('세션이 종료되었습니다.', {
        onConfirm: () => window.location.reload()
      });
      break;

    case ResponseChatType.WORKER_DISCONNECTED:
      // 스트리밍 워커 연결 끊김
      showModal('연결이 끊어졌습니다.', {
        onConfirm: () => window.location.reload(),
      });
      break;

    // ========================================
    // 에러
    // ========================================

    case ResponseChatType.ERROR:
      // 서버 에러
      showToast(`서버 에러: ${message}`);
      break;

    case ResponseChatType.TEXT_ERROR:
      // 메시지 전송 실패
      showToast('메시지 전송에 실패했습니다.');
      break;

    case ResponseChatType.TEXT_MODERATION:
      // 부적절한 언어 필터링됨
      showToast('부적절한 내용이 포함되어 있습니다.');
      break;

    case ResponseChatType.EXCEED_CONCURRENT_QUOTA:
      // 동시 접속자 초과
      showModal('현재 접속자가 많습니다. 잠시 후 다시 시도해주세요.');
      break;
  }
});
```

---

## 전체 구현 예제

### features/chat/hooks/useChatSdk.ts

고수준 채팅 훅. 비즈니스 로직과 상태 관리를 통합합니다.

```typescript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useKlleonSdk from '@/hooks/useKlleonSdk';
import { ResponseChatType } from '@/types/klleon';
import type {
  ChatData,
  Status,
  LogLevelType,
  ModeType,
  VoiceCodeType,
} from '@/types/klleon';

// ============================================================
// 인터페이스
// ============================================================

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
}

interface UseChatSdkProps {
  /** SDK 키 (필수) */
  sdkKey: string;
  /** 아바타 ID (필수) */
  avatarId: string;
  /** 언어 설정 */
  language?: VoiceCodeType;
  /** 환경 모드 */
  mode?: ModeType;
  /** 로그 레벨 */
  logLevel?: LogLevelType;
  /** 마이크 활성화 */
  enableMicrophone?: boolean;
}

interface UseChatSdkReturn {
  // 상태
  isLoading: boolean;
  isReady: boolean;
  loadingProgress: number;
  messages: Message[];
  isTyping: boolean;
  error: string | null;

  // 액션
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  stopSpeech: () => void;

  // SDK 인스턴스
  sdk: ReturnType<typeof useKlleonSdk>['sdk'];
}

// ============================================================
// 훅 구현
// ============================================================

const useChatSdk = ({
  sdkKey,
  avatarId,
  language = 'ko_kr',
  mode = 'prod',
  logLevel = 'silent',
  enableMicrophone = false,
}: UseChatSdkProps): UseChatSdkReturn => {
  const { sdk } = useKlleonSdk();

  // 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // refs
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // ========================================
  // 유틸리티 함수
  // ========================================

  /**
   * 로딩 진행률 애니메이션
   */
  const animateProgress = useCallback((start: number, end: number) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setLoadingProgress(start);

    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= end) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return end;
        }
        return prev + 2;
      });
    }, 100);
  }, []);

  /**
   * 진행률 애니메이션 정지
   */
  const stopProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * 메시지 추가
   */
  const addMessage = useCallback(
    (text: string, sender: 'user' | 'avatar', id?: string) => {
      const newMessage: Message = {
        id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        sender,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  // ========================================
  // 공개 액션
  // ========================================

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    (text: string) => {
      if (!isReady || !text.trim()) return;

      addMessage(text, 'user');
      sdk.sendTextMessage(text);
    },
    [isReady, sdk, addMessage]
  );

  /**
   * 메시지 목록 초기화
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    sdk.clearMessageList();
  }, [sdk]);

  /**
   * 아바타 발화 중단
   */
  const stopSpeech = useCallback(() => {
    sdk.stopSpeech();
  }, [sdk]);

  // ========================================
  // SDK 초기화
  // ========================================

  useEffect(() => {
    if (!sdkKey || !avatarId || isInitializedRef.current) return;

    const initializeSDK = async () => {
      setIsLoading(true);
      setError(null);
      animateProgress(0, 30);

      try {
        // 상태 이벤트 핸들러 등록
        sdk.onStatusEvent((status: Status) => {
          switch (status) {
            case 'CONNECTING':
              animateProgress(10, 30);
              break;
            case 'SOCKET_CONNECTED':
              animateProgress(30, 50);
              break;
            case 'STREAMING_CONNECTED':
              animateProgress(50, 70);
              break;
            case 'CONNECTED_FINISH':
              animateProgress(70, 85);
              break;
            case 'VIDEO_LOAD':
              animateProgress(85, 95);
              break;
            case 'VIDEO_CAN_PLAY':
              stopProgress();
              setLoadingProgress(100);
              setIsReady(true);
              setIsLoading(false);
              break;
            case 'CONNECTING_FAILED':
            case 'SOCKET_FAILED':
            case 'STREAMING_FAILED':
              stopProgress();
              setIsLoading(false);
              setError(`연결 실패: ${status}`);
              break;
          }
        });

        // 채팅 이벤트 핸들러 등록
        sdk.onChatEvent((event: ChatData) => {
          switch (event.chat_type) {
            case ResponseChatType.TEXT:
              setIsTyping(false);
              addMessage(event.message, 'avatar', event.id);
              break;
            case ResponseChatType.PREPARING_RESPONSE:
              setIsTyping(true);
              break;
            case ResponseChatType.RESPONSE_IS_ENDED:
            case ResponseChatType.RESPONSE_OK:
              setIsTyping(false);
              break;
            case ResponseChatType.STT_RESULT:
              addMessage(event.message, 'user');
              break;
            case ResponseChatType.DISABLED_TIME_OUT:
              setError('세션이 타임아웃되었습니다.');
              break;
            case ResponseChatType.WORKER_DISCONNECTED:
              setError('연결이 끊어졌습니다.');
              break;
          }
        });

        // SDK 초기화 실행
        await sdk.init({
          sdk_key: sdkKey,
          avatar_id: avatarId,
          voice_code: language,
          subtitle_code: language,
          mode,
          log_level: logLevel,
          enable_microphone: enableMicrophone,
        });

        isInitializedRef.current = true;
      } catch (e) {
        stopProgress();
        setIsLoading(false);
        setError(e instanceof Error ? e.message : 'SDK 초기화 실패');
      }
    };

    initializeSDK();

    // 클린업
    return () => {
      stopProgress();
      if (isInitializedRef.current) {
        sdk.destroy();
        isInitializedRef.current = false;
      }
    };
  }, [
    sdkKey,
    avatarId,
    language,
    mode,
    logLevel,
    enableMicrophone,
    sdk,
    animateProgress,
    stopProgress,
    addMessage,
  ]);

  // ========================================
  // 브라우저 종료 시 정리
  // ========================================

  useEffect(() => {
    const handleBeforeUnload = () => {
      sdk.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sdk]);

  return {
    // 상태
    isLoading,
    isReady,
    loadingProgress,
    messages,
    isTyping,
    error,

    // 액션
    sendMessage,
    clearMessages,
    stopSpeech,

    // SDK
    sdk,
  };
};

export default useChatSdk;
```

### 사용 예시 (React 컴포넌트)

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import useChatSdk from './hooks/useChatSdk';

interface ChatPageProps {
  sdkKey: string;
  avatarId: string;
}

const ChatPage = ({ sdkKey, avatarId }: ChatPageProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLElement & { videoStyle?: React.CSSProperties; volume?: number }>(null);

  const {
    isLoading,
    isReady,
    loadingProgress,
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    stopSpeech,
  } = useChatSdk({
    sdkKey,
    avatarId,
    language: 'ko_kr',
    mode: 'prod',
    logLevel: 'silent',
  });

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 아바타 컨테이너 설정
  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.videoStyle = {
        borderRadius: '16px',
        objectFit: 'cover',
      };
      avatarRef.current.volume = 100;
    }
  }, []);

  // 메시지 전송 핸들러
  const handleSend = () => {
    if (!inputValue.trim() || !isReady) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>아바타 연결 중... {loadingProgress}%</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="error-container">
        <p>오류가 발생했습니다: {error}</p>
        <button onClick={() => window.location.reload()}>새로고침</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* 아바타 영역 */}
      <div className="avatar-section">
        <avatar-container ref={avatarRef} />
        <div className="avatar-controls">
          <button onClick={stopSpeech} disabled={!isReady}>
            발화 중단
          </button>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="messages-section">
        <div className="messages-header">
          <h3>채팅</h3>
          <button onClick={clearMessages}>초기화</button>
        </div>

        <div className="messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message message-${msg.sender}`}
            >
              <span className="message-sender">
                {msg.sender === 'user' ? '나' : '아바타'}
              </span>
              <p className="message-text">{msg.text}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="message message-avatar typing">
              <span>아바타가 입력 중...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isReady ? '메시지를 입력하세요' : '연결 중...'}
            disabled={!isReady}
          />
          <button onClick={handleSend} disabled={!isReady || !inputValue.trim()}>
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
```

### 스타일 (CSS)

```css
.chat-container {
  display: flex;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  gap: 24px;
  padding: 24px;
}

/* 아바타 영역 */
.avatar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avatar-section avatar-container {
  flex: 1;
  min-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
}

.avatar-controls {
  display: flex;
  gap: 8px;
}

/* 메시지 영역 */
.messages-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
}

.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message-user {
  align-self: flex-end;
  background: #007bff;
  color: white;
}

.message-avatar {
  align-self: flex-start;
  background: #f0f0f0;
}

.message.typing {
  opacity: 0.7;
  font-style: italic;
}

/* 입력 영역 */
.input-section {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.input-section input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.input-section button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.input-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 로딩 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

/* 에러 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}
```

---

## 환경 변수

### .env.local (Next.js)

```env
# SDK 키와 아바타 ID는 서버 컴포넌트에서 API로 받아오는 것을 권장
# 클라이언트에 직접 노출하는 경우:
NEXT_PUBLIC_SDK_KEY=your_sdk_key
NEXT_PUBLIC_AVATAR_ID=your_avatar_id

# SDK 환경 모드
# prod: 프로덕션 서버
# stg: 스테이징 서버
# dev: 개발 서버
# demo: 데모 서버
NEXT_PUBLIC_SDK_MODE=prod

# 로그 레벨 (프로덕션에서는 silent 권장)
# debug: 모든 로그 출력
# info: 정보 이상 출력
# warn: 경고 이상 출력
# error: 에러만 출력
# silent: 로그 없음
NEXT_PUBLIC_SDK_LOG_LEVEL=silent
```

### 환경별 설정 예시

```typescript
// config/sdk.ts
export const getSdkConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    mode: isDevelopment ? 'dev' : 'prod',
    logLevel: isDevelopment ? 'debug' : 'silent',
    enableMicrophone: false,
  } as const;
};
```

---

## 고급 활용

### 1. 커스텀 UI 구현 (chat-container 미사용)

SDK의 `<chat-container>` 대신 자체 UI를 구현하는 경우:

```typescript
// onChatEvent로 모든 메시지를 직접 처리
sdk.onChatEvent((event) => {
  if (event.chat_type === ResponseChatType.TEXT) {
    // 자체 메시지 목록에 추가
    addToMyMessageList({
      id: event.id,
      content: event.message,
      time: event.time,
      isAvatar: true,
    });
  }
});

// 메시지 전송도 직접 처리
const handleSend = (text: string) => {
  addToMyMessageList({
    id: generateId(),
    content: text,
    time: new Date().toISOString(),
    isAvatar: false,
  });
  sdk.sendTextMessage(text);
};
```

### 2. 음성 인식 (STT) 활용

```typescript
const [isRecording, setIsRecording] = useState(false);

const startVoiceInput = () => {
  setIsRecording(true);
  sdk.startStt();
};

const stopVoiceInput = () => {
  setIsRecording(false);
  sdk.endStt(); // 자동으로 텍스트 변환 후 전송됨
};

const cancelVoiceInput = () => {
  setIsRecording(false);
  sdk.cancelStt(); // 취소 (전송 안 함)
};

// STT 결과 처리
sdk.onChatEvent((event) => {
  if (event.chat_type === ResponseChatType.STT_RESULT) {
    // 음성이 텍스트로 변환됨
    console.log('변환된 텍스트:', event.message);
  }
});
```

### 3. 아바타 변경

```typescript
const changeToNewAvatar = async (newAvatarId: string) => {
  try {
    setIsChanging(true);

    await sdk.changeAvatar({
      avatar_id: newAvatarId,
      voice_code: 'ko_kr',
      subtitle_code: 'ko_kr',
      voice_tts_speech_speed: 1.0,
    });

    // 새 아바타로 연결됨
    setCurrentAvatarId(newAvatarId);
  } catch (error) {
    console.error('아바타 변경 실패:', error);
  } finally {
    setIsChanging(false);
  }
};
```

### 4. 에코 기능 활용

사용자가 입력한 텍스트를 아바타가 그대로 읽게 하기:

```typescript
// 텍스트 에코
const makeAvatarSpeak = (text: string) => {
  sdk.echo(text);
};

// 오디오 에코 (Base64, 0.1MB 제한)
const playAudioThroughAvatar = (base64Audio: string) => {
  sdk.startAudioEcho(base64Audio);
};

const stopAudioEcho = () => {
  sdk.endAudioEcho();
};
```

### 5. avatar-container 직접 제어

`<avatar-container>` 웹 컴포넌트의 비디오 요소에 직접 접근하여 스타일, 볼륨 등을 동적으로 제어할 수 있습니다.

**비디오 요소 접근 및 스타일 변경:**

```typescript
const avatarRef = useRef<HTMLElement & { videoStyle?: React.CSSProperties; volume?: number }>(null);

useEffect(() => {
  if (avatarRef.current) {
    // 비디오 스타일 동적 변경
    avatarRef.current.videoStyle = {
      borderRadius: '16px',
      objectFit: 'cover',
      filter: 'brightness(1.1)',
    };

    // 볼륨 조절 (0~100)
    avatarRef.current.volume = 80;
  }
}, []);

// JSX
<avatar-container ref={avatarRef} />
```

**전체화면 처리:**

```typescript
const toggleFullscreen = async () => {
  const container = avatarRef.current;
  if (!container) return;

  // Shadow DOM 내부의 video 요소 접근
  const video = container.shadowRoot?.querySelector('video');

  if (!video) return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    // 컨테이너 전체를 전체화면으로 (비디오만 하면 컨트롤이 깨질 수 있음)
    await container.requestFullscreen();
  }
};
```

**볼륨 동적 조절:**

```typescript
const VolumeControl = () => {
  const [volume, setVolume] = useState(100);
  const avatarRef = useRef<HTMLElement & { volume?: number }>(null);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (avatarRef.current) {
      avatarRef.current.volume = newVolume;
    }
  };

  return (
    <div>
      <avatar-container ref={avatarRef} />
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
      />
      <span>{volume}%</span>
    </div>
  );
};
```

### 6. 연결 상태 모니터링

```typescript
const [connectionStatus, setConnectionStatus] = useState<Status>('IDLE');

sdk.onStatusEvent((status) => {
  setConnectionStatus(status);

  // 연결 품질 모니터링
  if (status === 'STREAMING_FAILED') {
    // WebRTC 연결 실패 시 네트워크 문제일 수 있음
    checkNetworkAndRetry();
  }
});

// 연결 상태 UI
const getStatusMessage = (status: Status) => {
  const statusMessages: Record<Status, string> = {
    IDLE: '대기 중',
    CONNECTING: '연결 중...',
    CONNECTING_FAILED: '연결 실패',
    SOCKET_CONNECTED: 'WebSocket 연결됨',
    SOCKET_FAILED: 'WebSocket 연결 실패',
    STREAMING_CONNECTED: '스트리밍 연결됨',
    STREAMING_FAILED: '스트리밍 연결 실패',
    CONNECTED_FINISH: '연결 완료',
    VIDEO_LOAD: '비디오 로딩 중',
    VIDEO_CAN_PLAY: '준비 완료',
  };
  return statusMessages[status];
};
```

---

## 브라우저 호환성

### 지원 브라우저

Klleon Chat SDK는 WebRTC 기반으로 동작하며, 다음 브라우저를 지원합니다:

**데스크톱:**

| 브라우저 | 최소 버전 | 비고 |
|----------|----------|------|
| Chrome | 74+ | 권장 브라우저 |
| Firefox | 78+ | |
| Safari | 14.1+ | macOS 11+ 필요 |
| Edge | 79+ (Chromium 기반) | |

**모바일:**

| 플랫폼 | 브라우저 | 최소 버전 | 비고 |
|--------|----------|----------|------|
| iOS | Safari | 14.5+ | iOS 14.5+ 필요 |
| iOS | Chrome | 74+ | WKWebView 사용 |
| Android | Chrome | 74+ | |
| Android | Samsung Internet | 12.0+ | |

### WebRTC 요구사항

SDK는 다음 WebRTC API를 사용합니다:
- `RTCPeerConnection`: 스트리밍 연결
- `getUserMedia`: 마이크 입력 (STT 기능 사용 시)
- `MediaStream`: 미디어 스트림 처리

```typescript
// WebRTC 지원 여부 확인
const checkWebRTCSupport = (): boolean => {
  return !!(
    window.RTCPeerConnection &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};

if (!checkWebRTCSupport()) {
  showModal('이 브라우저는 지원되지 않습니다. Chrome, Safari, Firefox를 사용해주세요.');
}
```

### 모바일 브라우저 주의사항

1. **자동재생 정책**: 모바일 브라우저는 사용자 인터랙션 없이 비디오/오디오 자동재생을 차단합니다.
   - 해결: 사용자가 버튼을 클릭한 후 `init()` 호출
   ```typescript
   const handleStartChat = async () => {
     // 사용자 클릭 이벤트 내에서 호출
     await sdk.init(options);
   };
   ```

2. **화면 잠금/백그라운드**: 앱이 백그라운드로 전환되면 연결이 끊길 수 있습니다.
   ```typescript
   useEffect(() => {
     const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible') {
         // 포그라운드 복귀 시 연결 상태 확인
         // 필요시 페이지 새로고침
       }
     };
     document.addEventListener('visibilitychange', handleVisibilityChange);
     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
   }, []);
   ```

3. **iOS Safari 특이사항**:
   - 저전력 모드에서 성능 저하 가능
   - WebRTC 연결 제한이 더 엄격함

4. **인앱 브라우저 제한**: 일부 인앱 브라우저(카카오톡, 네이버 등)는 WebRTC를 완전히 지원하지 않을 수 있습니다.
   ```typescript
   // 인앱 브라우저 감지
   const isInAppBrowser = (): boolean => {
     const ua = navigator.userAgent.toLowerCase();
     return /kakaotalk|naver|line|instagram|fb_iab|fban|fbav/i.test(ua);
   };

   if (isInAppBrowser()) {
     // 외부 브라우저로 열기 유도
     showModal('더 나은 경험을 위해 Chrome 또는 Safari에서 열어주세요.');
   }
   ```

---

## API 응답 JSON 예시

### ChatData 실제 응답 예시

**아바타 텍스트 메시지 (TEXT):**
```json
{
  "message": "안녕하세요! 무엇을 도와드릴까요?",
  "chat_type": "TEXT",
  "time": "2024-01-15T10:30:45.123Z",
  "id": "msg_a1b2c3d4e5f6"
}
```

**음성 인식 결과 (STT_RESULT):**
```json
{
  "message": "오늘 날씨가 어때?",
  "chat_type": "STT_RESULT",
  "time": "2024-01-15T10:31:00.456Z",
  "id": "stt_x1y2z3w4"
}
```

**대기열 진입 (WAIT):**
```json
{
  "message": "3",
  "chat_type": "WAIT",
  "time": "2024-01-15T10:29:00.000Z",
  "id": "wait_001"
}
```
> `message`에 대기 인원 수가 문자열로 포함됩니다.

**응답 준비 중 (PREPARING_RESPONSE):**
```json
{
  "message": "",
  "chat_type": "PREPARING_RESPONSE",
  "time": "2024-01-15T10:31:02.000Z",
  "id": "prep_001"
}
```

**응답 완료 (RESPONSE_IS_ENDED):**
```json
{
  "message": "",
  "chat_type": "RESPONSE_IS_ENDED",
  "time": "2024-01-15T10:31:15.000Z",
  "id": "end_001"
}
```

---

## 트러블슈팅

### SDK가 로드되지 않음

```typescript
// window.KlleonChat 체크
if (typeof window === 'undefined' || !window.KlleonChat) {
  throw new Error('KlleonChat is not available');
}
```

**해결책:**
1. `<script>` 태그가 올바른 위치에 있는지 확인 (`<head>` 또는 `<body>` 상단)
2. SDK 버전이 올바른지 확인 (예: `1.2.0`)
3. 브라우저 개발자 도구에서 네트워크 오류 확인
4. CORS 문제 확인 (도메인이 등록되어 있어야 함)

### VIDEO_CAN_PLAY가 발생하지 않음

**원인:**
- 잘못된 `sdk_key` 또는 `avatar_id`
- 도메인이 클레온 스튜디오에 등록되지 않음
- 네트워크 문제

**해결책:**
1. 클레온 스튜디오에서 도메인 등록 확인
2. `sdk_key`와 `avatar_id` 값 확인
3. 콘솔에서 에러 메시지 확인
4. `log_level: 'debug'`로 설정하여 상세 로그 확인

### 중복 초기화 문제

```typescript
// 항상 destroy 먼저 호출
sdk.destroy();
await sdk.init(options);
```

또는 ref로 초기화 상태 관리:

```typescript
const isInitializedRef = useRef(false);

useEffect(() => {
  if (isInitializedRef.current) return;

  const init = async () => {
    await sdk.init(options);
    isInitializedRef.current = true;
  };

  init();

  return () => {
    sdk.destroy();
    isInitializedRef.current = false;
  };
}, []);
```

### 메모리 누수

```typescript
// useEffect cleanup에서 반드시 destroy 호출
useEffect(() => {
  // 초기화 로직
  return () => {
    sdk?.destroy();
  };
}, []);

// beforeunload 이벤트 처리 (탭/창 닫을 때)
useEffect(() => {
  const handleBeforeUnload = () => sdk?.destroy();
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [sdk]);

// visibilitychange 이벤트 처리 (페이지 숨김 시)
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // 페이지가 숨겨질 때 필요한 처리
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### TypeScript 에러

```typescript
// Window 타입 확장이 필요한 경우
// types/klleon.d.ts에 추가:
declare global {
  interface Window {
    KlleonChat: KlleonChat;
  }
}

export {};
```

### React StrictMode에서 이중 호출

```typescript
// React 18 StrictMode에서 useEffect가 두 번 호출됨
// ref로 초기화 상태 추적:
const isInitializedRef = useRef(false);

useEffect(() => {
  if (isInitializedRef.current) return;
  isInitializedRef.current = true;

  // 초기화 로직
}, []);
```

---

## 체크리스트

### 구현 전

- [ ] 클레온 스튜디오 계정 생성
- [ ] 도메인 등록 완료
- [ ] SDK 키 발급 완료
- [ ] 아바타 ID 확인
- [ ] SDK 스크립트 로드 확인
- [ ] 타입 정의 파일 생성

### 구현 중

- [ ] `useKlleonSdk` 훅 구현
- [ ] `useChatSdk` 훅 구현 (또는 커스터마이징)
- [ ] 상태 이벤트 핸들러 구현
- [ ] 채팅 이벤트 핸들러 구현
- [ ] 로딩 UI 구현
- [ ] 에러 UI 구현

### 배포 전

- [ ] `mode`를 `prod`로 변경
- [ ] `log_level`을 `silent`로 변경
- [ ] cleanup 함수 정상 동작 확인
- [ ] 브라우저 종료 시 정리 확인
- [ ] 메모리 누수 테스트
- [ ] 다양한 브라우저에서 테스트 (Chrome, Safari, Firefox, Edge)
- [ ] 모바일 브라우저 테스트
