# PARA 메소드 이해 & Gemini Tabs 활용 방향 정리

> 정리 일시: 2026-01-07

---

## 🎯 PARA 핵심 철학

> **"모든 것은 Projects를 위해 존재한다"**

- Projects = 🚀 **치고 나가는 것** (목표 + 마감 있음)
- Areas, Resources, Archives = Projects를 **지원**

---

## 📦 4개 폴더 정의

| 폴더 | 핵심 | 판단 기준 |
|-----|------|----------|
| **Projects** | 지금 하고 있는 일, 끝나는 일 | "언제까지 끝내야 해?" |
| **Areas** | 내부 (나의 경험, 나의 기록) | "내가 만들어낸 것인가?" |
| **Resources** | 외부 (수집한 정보, 레퍼런스) | "외부에서 가져온 것인가?" |
| **Archives** | 끝났거나 비활성화된 것 | "더 이상 안 쓰나?" |

---

## 🔑 Areas vs Resources 핵심 차이

```
Areas     = 내부 (나의 경험, 나의 기록, 나의 상황)
Resources = 외부 (인터넷 정보, 책, 다른 사람 자료)
```

**예시:**
- 내가 쓴 챌린지 운영 회고 → **Areas/**
- 인터넷에서 찾은 챌린지 운영 팁 → **Resources/**

---

## 🔄 Projects 중심 흐름

```
Areas (내 경험)  →  "이걸 바탕으로 프로젝트 시작!"
                        ↓
              Projects (구체적 실행)  ←  Resources (외부 자료로 보완)
                        ↓
              Archives (완료 후 보관)
```

---

## ❓ 미결 이슈: Gemini 대화 저장 위치

| 관점 | 위치 |
|-----|------|
| 내 생각을 Gemini가 정리해준 것 | **Areas/** |
| 외부 AI가 생성한 정보 | **Resources/** |

**결정 필요:** 어떤 기준으로 구분할 것인가?

---

## 📋 현재까지의 저장 규칙 (v1.1.0)

| 조건 | 저장 위치 |
|-----|----------|
| PARA 폴더 미지정 | ❌ 저장 불가 |
| 프로젝트 미선택 | `Resources/gemini/` |
| 프로젝트 선택됨 | `Projects/[프로젝트]/outputs/` |

---

## 🚀 다음 단계 후보

1. Gemini 대화를 Areas vs Resources 구분하는 방법 결정
2. context.md 자동 주입 기능
3. Resources/prompts 연동
