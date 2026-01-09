# Gemini Tabs 설치 가이드

## 🎯 목표

이 가이드를 따라하면:
- macOS에서 **Gemini Tabs** 앱을 설치하고 실행할 수 있습니다
- "손상되었기 때문에 열 수 없습니다" 보안 경고를 해결할 수 있습니다

---

## 📋 필요한 것

- macOS 컴퓨터 (Apple Silicon 또는 Intel)
- 인터넷 연결

---

## 🚀 설치 단계

### Step 1: 앱 다운로드

1. [GitHub 릴리스 페이지](https://github.com/tobeythebully/gemini_tabs/releases) 접속
2. 최신 버전의 **`Gemini Tabs-x.x.x-arm64-mac.zip`** 클릭하여 다운로드

> 💡 파일이 **Downloads** 폴더에 저장됩니다

---

### Step 2: 압축 해제

1. **Downloads** 폴더 열기
2. 다운로드한 `.zip` 파일 **더블클릭**
3. `Gemini Tabs.app` 파일이 생성됨

---

### Step 3: 보안 경고 해결

macOS는 Apple 공증을 받지 않은 앱을 차단합니다.  
아래 방법으로 해결하세요:

#### 터미널 열기
1. **Spotlight** 열기: `Cmd + Space`
2. `터미널` 입력 후 Enter

#### 명령어 실행
1. 터미널에 아래 명령어 입력 (Enter는 아직 누르지 마세요):
   ```
   sudo xattr -cr 
   ```
   > ⚠️ `xattr -cr ` 뒤에 **공백 하나** 있어야 합니다

2. **Finder에서 `Gemini Tabs.app`을 터미널 창으로 드래그**
   > 경로가 자동으로 입력됩니다

3. Enter 누르기

4. **비밀번호 입력** (화면에 아무것도 안 보이는 게 정상)

5. Enter 누르기

---

### Step 4: 앱 실행

1. `Gemini Tabs.app` **더블클릭**
2. 처음 실행 시 "알 수 없는 개발자" 경고가 뜨면:
   - **시스템 설정 → 개인정보 보호 및 보안 → "확인 없이 열기"** 클릭

---

## ✅ 완료!

Gemini Tabs가 실행되면 성공입니다! 🎉

---

## ❓ 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| "손상되었기 때문에 열 수 없습니다" | Step 3의 터미널 명령어 다시 실행 |
| 비밀번호가 안 쳐짐 | 정상입니다. 타이핑하고 Enter 누르세요 |
| "알 수 없는 개발자" 경고 | 시스템 설정에서 "확인 없이 열기" 클릭 |

---

## 📁 앱 이동 (선택사항)

편의를 위해 `Gemini Tabs.app`을 **Applications** 폴더로 이동할 수 있습니다:

1. Finder에서 `Gemini Tabs.app` 선택
2. `Cmd + C` (복사)
3. **Applications** 폴더로 이동
4. `Cmd + V` (붙여넣기)
