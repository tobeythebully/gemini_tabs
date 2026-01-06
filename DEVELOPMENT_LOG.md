# Gemini Tabs 개발 기록

## 프로젝트 탄생 배경

### 문제 상황
기존 **Google Gemini.app** (Chrome App)에서는 탭 기능을 사용할 수 없었습니다. 여러 대화를 오가며 작업하고 싶었지만, Chrome App은 단순히 `gemini.google.com`을 단일 창으로 래핑한 바로가기일 뿐이어서 내부 코드나 UI를 수정하는 것이 불가능했습니다.

### 시도한 대안들
1. **Chrome 브라우저에서 직접 사용** - 가능하지만 전용 앱 경험이 아님
2. **Gemini API 활용** - API 없이 기존 Gemini 웹 인터페이스를 그대로 쓰고 싶음

### 최종 해결책: Electron
**Electron의 `<webview>` 태그**를 사용하면 일반 웹에서는 보안 정책(X-Frame-Options)으로 불가능한 Gemini 웹페이지 임베딩이 가능합니다. 이를 통해:
- API 없이 기존 Gemini 웹 인터페이스 그대로 사용
- 멀티탭 기능 구현
- 추가 기능(북마크, 프롬프트 슬래시 명령어) 확장 가능

---

## 프로젝트 개요
- **앱 이름**: Gemini Tabs
- **목적**: Google Gemini를 멀티탭으로 사용할 수 있는 macOS 데스크탑 앱
- **기술 스택**: Electron, JavaScript, HTML, CSS

---

## 주요 기능

### 1. 멀티탭 브라우징
- 여러 Gemini 채팅을 탭으로 관리
- 동적 탭 제목 감지 (채팅 내용 기반)

### 2. 북마크 기능
- 자주 사용하는 채팅 URL 저장
- 별표(⭐) 클릭으로 빠르게 추가/삭제

### 3. 프롬프트 슬래시 명령어
- `/커맨드` + Tab으로 자주 쓰는 프롬프트 자동 입력
- **본문 어디서나 사용 가능** (채팅창 처음뿐 아니라 중간에서도!)
- 예: `안녕하세요 /요약 부탁` → Tab → `안녕하세요 [프롬프트] 부탁`

---

## 핵심 기술 해결 과정

### TrustedHTML 정책 우회
Google Gemini 페이지는 `TrustedHTML` 보안 정책을 사용하여 `innerHTML` 직접 할당을 차단합니다.

**해결책**: `document.execCommand('insertText')` 사용
```javascript
// innerHTML 대신 execCommand 사용
document.execCommand('insertText', false, promptText);
```

### Quill 에디터 텍스트 선택 문제
Gemini는 Quill 에디터(`.ql-editor`)를 사용하며, 커서가 깜빡일 때 Range API가 모든 텍스트를 선택하지 못하는 문제가 있었습니다.

**시도한 방법들:**
| # | 방법 | 결과 |
|---|------|------|
| 1 | Range API selectNodeContents | 마지막 글자 남음 |
| 2 | DOM 직접 조작 (removeChild) | 프롬프트 미출력 |
| 3 | execCommand('selectAll') | 프롬프트 2번 출력 |
| 4 | 키보드 이벤트 시뮬레이션 | 프롬프트 2번 출력 |

**최종 해결책**: 이중 setTimeout + 처리 중 플래그
```javascript
// 처리 중 플래그로 중복 실행 방지
if (window.__promptProcessing) return;
window.__promptProcessing = true;

editor.focus();
setTimeout(() => {
    // Range API로 전체 선택
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    setTimeout(() => {
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, promptItem.prompt);
        
        setTimeout(() => {
            window.__promptProcessing = false;
        }, 100);
    }, 0);
}, 0);
```

### 프롬프트 실시간 동기화
프롬프트 추가/수정 시 앱 재시작 없이 모든 탭에 즉시 적용되도록 구현.

```javascript
save() {
    StorageManager.set('prompts', this.prompts);
    
    // 모든 탭에 즉시 업데이트
    if (window.tabManager && window.tabManager.tabs) {
        const promptsData = JSON.stringify(this.prompts);
        window.tabManager.tabs.forEach(tab => {
            tab.webview.executeJavaScript(`
                window.__prompts = ${promptsData};
            `).catch(() => {});
        });
    }
}
```

---

## 파일 구조
```
GeminiTabs/
├── main.js          # Electron 메인 프로세스
├── renderer.js      # 렌더러 프로세스 (탭, 북마크, 프롬프트 관리)
├── index.html       # 메인 UI
├── styles.css       # 스타일시트
├── package.json     # 프로젝트 설정
└── dist/            # 빌드 결과물
    └── Gemini Tabs-1.0.0-arm64.dmg
```

---

## 데이터 저장 위치
- **경로**: `~/Library/Application Support/gemini-tabs/`
- **방식**: Electron localStorage (LevelDB)
- **저장 항목**: 북마크, 프롬프트 커맨드

---

## 빌드 명령어
```bash
# 개발 모드 실행
npm start

# DMG 빌드
npm run build
```

---

## 버전 히스토리

### v1.1.0 (2026-01-06) - PARA 폴더 연동
- **PARA 폴더 연동 기능 추가**
  - 설정에서 로컬 PARA 폴더 경로 지정
  - Projects 하위 폴더 스캔 및 프로젝트 선택 UI
  - Electron IPC 통신으로 파일시스템 접근
- **대화 저장 기능 추가**
  - 탭에 💾 저장 버튼 추가
  - Gemini 대화 내용을 마크다운으로 추출
  - 선택한 프로젝트의 `outputs/` 폴더에 자동 저장
  - 커스텀 파일명 입력 모달

### v1.0.1 (2026-01-06)
- 본문 중간에서도 `/커맨드` + Tab 사용 가능
- 한글 IME 조합 문제 해결 (문자열 치환 방식 적용)
- 커서 위치 기반 커맨드 감지 알고리즘 구현

### v1.0.0 (2026-01-06)
- 멀티탭 브라우징 기능
- 북마크 기능
- 프롬프트 슬래시 명령어 기능
- 슬래시 명령어 버그 수정 (마지막 글자 남음, 프롬프트 중복 출력)
- 프롬프트 실시간 동기화 기능 추가

