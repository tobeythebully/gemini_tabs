# 빌드 및 배포 가이드

## 빌드 명령어

```bash
npm run build
```

## 배포 절차

### 1. 버전 업데이트
`package.json`의 `version` 필드 수정

### 2. 빌드 실행
```bash
npm run build
```

### 3. dist 폴더 정리
빌드 후 생성된 파일들을 버전 폴더로 이동:
```bash
cd dist
mkdir -p v{버전}
mv "Gemini Tabs-{버전}-arm64.dmg" "Gemini Tabs-{버전}-arm64.dmg.blockmap" v{버전}/
mv "Gemini Tabs-{버전}-arm64-mac.zip" "Gemini Tabs-{버전}-arm64-mac.zip.blockmap" v{버전}/
```

### 4. latest 폴더 업데이트
```bash
rm -rf dist/latest/*
cp dist/v{버전}/* dist/latest/
```

### 5. Git 커밋 및 푸시
```bash
git add -A
git commit -m "feat: {변경사항} (v{버전})"
git push
```

### 6. GitHub Release 생성
```bash
gh release create v{버전} --title "v{버전} - {제목}" --notes "{릴리스 노트}" "dist/v{버전}/Gemini Tabs-{버전}-arm64.dmg" "dist/v{버전}/Gemini Tabs-{버전}-arm64-mac.zip"
```

## dist 폴더 구조

```
dist/
├── latest/              # 최신 버전 (빠른 접근용)
├── v1.0.0/
├── v1.1.0/
├── v1.2.0/
├── mac-arm64/           # 빌드 임시 폴더
└── (설정 파일들)
```
