# Gemini Tabs

Google Gemini를 멀티탭으로 사용할 수 있는 macOS 데스크탑 앱입니다.

![Platform](https://img.shields.io/badge/platform-macOS-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)

---

## ✨ 주요 기능

### 🗂️ 멀티탭
여러 Gemini 대화를 탭으로 관리하고 빠르게 전환할 수 있습니다.

### ⭐ 북마크
자주 사용하는 채팅을 북마크하여 빠르게 접근하세요.

### ⚡ 슬래시 명령어
`/커맨드` + `Tab`으로 자주 쓰는 프롬프트를 자동 입력합니다.

예시:
- `/요약` → "다음 내용을 요약해주세요:"
- `/번역` → "다음을 한국어로 번역해주세요:"

---

## 📥 설치 방법

1. [Releases](https://github.com/tobeythebully/gemini_tabs/releases)에서 `Gemini Tabs-1.0.0-arm64.dmg` 다운로드
2. DMG 파일 열기
3. `Gemini Tabs.app`을 **Applications** 폴더로 드래그
4. 앱 실행!

> ⚠️ 처음 실행 시 "알 수 없는 개발자" 경고가 뜨면:  
> **시스템 설정 → 개인정보 보호 및 보안 → "확인 없이 열기"** 클릭

---

## 🎮 사용법

### 탭 관리
| 동작 | 방법 |
|------|------|
| 새 탭 열기 | `+` 버튼 또는 `Cmd + T` |
| 탭 닫기 | `✕` 버튼 또는 `Cmd + W` |
| 탭 전환 | `Cmd + 1~9` |

### 북마크
- 탭의 **☆** 클릭 → 북마크 추가
- 북마크 바에서 클릭 → 해당 채팅으로 이동

### 슬래시 명령어
1. **⚙️ 설정** → **프롬프트** 탭에서 명령어 추가
2. 채팅창에 `/명령어` 입력 (처음이든 본문 중간이든 어디서나!)
3. `Tab` 키 → 저장된 프롬프트로 자동 대체

**예시:**
- `안녕하세요 /요약 부탁드립니다` + Tab → `안녕하세요 [프롬프트 내용] 부탁드립니다`

---

## 💾 데이터 저장 위치

북마크와 프롬프트는 아래 경로에 저장됩니다:
```
~/Library/Application Support/gemini-tabs/
```

---

## 🛠️ 개발자용

### 개발 모드 실행
```bash
cd GeminiTabs
npm install
npm start
```

### 빌드
```bash
npm run build
```

---

## 📄 라이선스

MIT License

---

Made with ❤️ using Electron
