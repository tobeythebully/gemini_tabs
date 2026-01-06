# renderer.js 개발 로그

## 파일 개요
- **역할**: Electron 렌더러 프로세스
- **책임**: UI 로직, 탭/북마크/프롬프트 관리

---

## 클래스 구조

### 1. StorageManager
localStorage 래퍼 클래스
```javascript
StorageManager.get(key, defaultValue)
StorageManager.set(key, value)
```

### 2. BookmarkManager
북마크 CRUD 및 UI 렌더링
- `add(title, url)` - 북마크 추가
- `delete(id)` - 북마크 삭제
- `render()` - UI 업데이트

### 3. PromptManager
슬래시 명령어 관리
- `add(command, prompt)` - 명령어 추가
- `save()` - 저장 + 모든 탭에 실시간 동기화
- `getByCommand(command)` - 명령어로 프롬프트 조회

### 4. TabManager
멀티탭 관리
- `createTab(url)` - 새 탭 생성
- `closeTab(tabId)` - 탭 닫기
- `switchToTabById(tabId)` - 탭 전환

---

## 핵심 기술 이슈

### 슬래시 명령어 버그 (2026-01-06)
**문제**: `/커맨드` + Tab 시 마지막 글자 남음 / 프롬프트 2번 출력

**원인 분석**:
1. Quill 에디터의 복잡한 DOM 구조
2. 커서 깜빡임 시 Range API 선택 불완전
3. 빠른 Tab 입력 시 이벤트 중복 실행

**해결**: 
- 이중 `setTimeout(0)` 사용
- `__promptProcessing` 플래그로 중복 방지

```javascript
if (window.__promptProcessing) return;
window.__promptProcessing = true;
// ... 처리 로직 ...
setTimeout(() => { window.__promptProcessing = false; }, 100);
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-06 | 초기 생성 - TabManager, BookmarkManager, PromptManager |
| 2026-01-06 | 슬래시 명령어 버그 수정 (마지막 글자/중복 출력) |
| 2026-01-06 | 프롬프트 실시간 동기화 기능 추가 |
