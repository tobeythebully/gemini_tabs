# main.js 개발 로그

## 파일 개요
- **역할**: Electron 메인 프로세스
- **책임**: 앱 윈도우 생성, 시스템 이벤트 처리

---

## 주요 기능

### BrowserWindow 생성
```javascript
const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true  // webview 태그 활성화
    }
});
```

### webviewTag 설정
`webviewTag: true`는 렌더러에서 `<webview>` 태그를 사용하기 위해 필수입니다.

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-06 | 초기 생성 - 기본 윈도우 설정 |
