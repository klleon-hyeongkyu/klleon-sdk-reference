# Klleon Chat SDK UI 컴포넌트 사용법

## 개요

Klleon Chat SDK는 두 가지 웹 컴포넌트를 제공합니다: `<avatar-container />`(아바타 스트리밍 영상)와 `<chat-container />`(채팅 인터페이스). 이들은 HTML 태그처럼 사용되며 속성과 CSS로 제어됩니다.

## `<avatar-container />` 컴포넌트

아바타 실시간 스트리밍 영상을 표시하는 컨테이너입니다.

### 주요 속성

| 속성명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| volume | number | 100 | 아바타 음성 볼륨을 조절합니다. (0 ~ 100 사이의 값) |
| videoStyle | StyleObject \| null | null | 내부 비디오 요소에 적용할 CSS 스타일 객체 |

### 사용 예시

```jsx
const avatarRef = useRef<HTMLElement & AvatarProps>(null);

useEffect(() => {
  avatarRef.current.videoStyle = {
    borderRadius: "30px",
    objectFit: "cover",
  };
  avatarRef.current.volume = 100;
}, []);

<avatar-container ref={avatarRef} class="your-class" />;
```

## `<chat-container />` 컴포넌트

사용자와 아바타 간 대화 표시 및 메시지 입력 인터페이스를 제공합니다.

### 주요 속성

| 속성명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| type | 'text' \| 'voice' | 'text' | 채팅 입력창의 초기 모드를 설정합니다 |
| delay | number | 30 | 아바타 메시지 타이핑 효과 지연(밀리초) |
| isShowCount | boolean | true | 텍스트 입력 모드일 때, 현재 입력된 글자 수 및 최대 글자 수 카운터 표시 여부 |

### 사용 예시

```jsx
const chatRef = useRef<HTMLElement & ChatProps>(null);

useEffect(() => {
  chatRef.current.delay = 50;
  chatRef.current.type = "text";
  chatRef.current.isShowCount = true;
}, []);

<chat-container ref={chatRef} class="your-class" />;
```

## 속성 설정 방식

- **HTML:** `video-style='{"borderRadius": "12px"}'` (kebab-case)
- **JavaScript:** `element.videoStyle = { borderRadius: "12px" }` (camelCase)
- **React:** `ref.current.videoStyle = { borderRadius: "12px" }`

## 중요 사항

1. React에서는 `className` 대신 HTML 표준 `class` 속성을 사용해야 합니다
2. `videoStyle`은 외부 스타일과 별개로 비디오 화면 자체의 스타일을 제어합니다
3. SDK 초기화 시 유효한 `sdk_key`와 `avatar_id`가 필요합니다
