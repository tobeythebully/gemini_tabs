# index.html 개발 로그

## 파일 개요
- **역할**: 메인 UI 마크업
- **책임**: 앱 레이아웃, 설정 모달

---

## 구조

```
body
├── #header
│   ├── #tabList (탭 목록)
│   ├── #newTabBtn (+버튼)
│   └── #settingsBtn (⚙️)
├── #bookmarkBar (북마크 바)
├── #webviewContainer (탭 콘텐츠 영역)
└── #settingsModal (설정 모달)
    ├── 북마크 탭
    └── 프롬프트 탭
```

---

## 주요 요소

| ID | 역할 |
|----|------|
| `#tabList` | 탭 버튼들이 동적으로 추가되는 컨테이너 |
| `#webviewContainer` | `<webview>` 요소들이 들어가는 영역 |
| `#settingsModal` | 설정 모달 (북마크/프롬프트 관리) |

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-06 | 초기 생성 - 탭바, 북마크바, 설정 모달 |
