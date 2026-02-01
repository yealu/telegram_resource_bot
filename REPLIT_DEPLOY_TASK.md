# Replit 배포 작업 현황

**작성일**: 2026-01-31 (최종 업데이트)
**상태**: 진행 중

---

## 📌 현재 상황 요약

### 문제점 3가지
1. **기존 Replit 프로젝트 (Node Suite) ES Module 오류**
   - 에러: `ReferenceError: require is not defined in ES module scope`
   - 원인: Replit AI Agent가 package.json에 `"type": "module"` 추가
   - bot.js는 CommonJS 방식(`require`) 사용 → 충돌

2. **로컬 서버 종료 시 봇 작동 안 함**
   - Replit 무료 플랜은 비활성 시 슬립 모드로 전환
   - UptimeRobot 설정되어 있으나, 깨어나는데 시간 소요
   - "뒤늦게" 작동하는 현상 발생

3. **한글/영어 요약 불안정**
   - 노션에 저장될 때 한글 요약이 영어로 들어오는 경우 발생
   - ✅ 해결: Claude API 프롬프트 수정 완료 (로컬 bot.js에 반영)

### 실패한 시도들
- 새 Replit 프로젝트 생성 시도 → "Start from scratch"는 유료
- "Web app" 또는 "Agents & Automations" 템플릿만 무료 사용 가능
- Node Suite Shell에서 `node bot.js` 실행 → ES Module 오류
- `cp attached_assets/bot.js ./bot.js` 후 실행 → 동일 오류

---

## ✅ 완료된 작업

1. ✅ 로컬에서 bot.js 수정 (한글 요약 프롬프트 개선)
2. ✅ 로컬 Node.js 프로세스 전체 종료 (9개 프로세스)
3. ✅ UptimeRobot 모니터 설정 (Node Suite URL)

---

## 🎯 최종 해결 계획: 기존 Node Suite 수정 (방안 A)

**새 프로젝트를 만들 필요 없음!** 기존 프로젝트에서 파일 2개만 교체하면 해결됩니다.

### 핵심 원인
`package.json`에 `"type": "module"`이 있어서 CommonJS `require()` 구문 사용 불가

### Step 1: Replit Node Suite 접속
- URL: https://replit.com/@tlsl111009/Node-Suite

### Step 2: bot.js 교체
- Replit 좌측 **Files** 패널에서 루트에 `bot.js` 파일 열기
  - 없으면 `attached_assets/bot.js`가 있을 수 있음
  - 루트에 `bot.js`가 없으면 새로 생성
- 전체 선택 (Ctrl+A) → 삭제
- 로컬 파일 전체 복사 후 붙여넣기
- **소스 파일**: `d:\개발 작업\telegram_resource\bot.js`

### Step 3: package.json 교체 (가장 중요!)
- Replit 좌측 **Files** 패널에서 `package.json` 클릭
- 전체 내용을 아래로 교체 (`"type": "module"` 없음!):

```json
{
  "name": "telegram-notion-bot",
  "version": "1.0.0",
  "description": "텔레그램 메시지를 노션에 자동 저장하는 봇",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "@notionhq/client": "^2.2.14",
    "@anthropic-ai/sdk": "^0.39.0",
    "dotenv": "^16.4.5",
    "express": "^4.18.2"
  }
}
```

### Step 4: Shell에서 실행
```bash
npm install
node bot.js
```

### Step 5: Secrets 확인
- Replit 좌측 🔒 **Secrets** 클릭
- 다음 4개가 설정되어 있는지 확인:

| Key | Value | 비고 |
|-----|-------|------|
| `TELEGRAM_BOT_TOKEN` | YOUR_BOT_TOKEN_HERE... | 사용자 보유 |
| `NOTION_TOKEN` | YOUR_NOTION_TOKEN_HERE... | 사용자 보유 |
| `NOTION_DATABASE_ID` | `2ec72625-11a3-81f5-9d25-cc5990dec3d7` | 고정값 |
| `ANTHROPIC_API_KEY` | sk-ant-... | 사용자 보유 |

### Step 6: UptimeRobot 확인
- https://uptimerobot.com 접속
- 기존 모니터가 Node Suite URL을 핑하고 있는지 확인
- 이미 설정됨: `replit.com/@tlsl111009/Node-Suite`

### Step 7: 테스트
1. Shell에서 성공 로그 확인:
   ```
   🤖 Telegram Notion Bot is starting...
   🎉 Bot is now running and listening for messages!
   🌐 웹 서버가 포트 3000에서 실행 중입니다.
   ```
2. 텔레그램에서 `@ganara111bot`에 메시지 전송
3. 봇 응답 확인: "⏳ 처리 중..." → "✅ 저장 완료!"
4. 노션에서 **한글 요약** 확인
5. 브라우저 탭 닫기 → 5분 후 다시 메시지 전송 → 응답 확인
6. **(최종)** 로컬 PC 종료 → 핸드폰에서 봇 테스트

---

## 📁 참고 파일 위치

### 로컬 파일 (복사 소스)
- **bot.js**: `d:\개발 작업\telegram_resource\bot.js` ← Replit에 복사할 파일
- **package.json**: `d:\개발 작업\telegram_resource\package.json`
- README: `d:\개발 작업\telegram_resource\README.md`
- 이 문서: `d:\개발 작업\telegram_resource\REPLIT_DEPLOY_TASK.md`

### Replit 프로젝트
- URL: https://replit.com/@tlsl111009/Node-Suite
- 사용자 ID: tlsl111009
- 프로젝트명: Node-Suite

---

## 🔧 bot.js 주요 수정 사항 (한글 요약 프롬프트)

**변경 전** (라인 278-295): 복잡한 프롬프트 → 영어 응답 발생

**변경 후**: 간결하고 명확한 프롬프트
```javascript
content: `아래 텍스트를 분석해서 카테고리와 요약을 생성하세요.

카테고리 (하나만 선택):
- AI/ML
- 개발
- 디자인
- 비즈니스
- 생산성
- 뉴스
- 기타

중요: 요약은 반드시 한국어로 2-3문장으로 작성하세요.

JSON 형식으로만 응답:
{"category": "카테고리명", "summary": "한국어 요약"}

텍스트:
${text}`
```

---

## 💡 중요 참고사항

### Replit 무료 플랜 제약
- 브라우저를 닫아도 서버는 실행됨 (클라우드 환경)
- 비활성 시간이 지나면 **슬립 모드**로 전환
- UptimeRobot이 5분마다 핑 → 슬립 방지 (100% 완벽하진 않음)
- 첫 메시지 응답이 5~10초 지연될 수 있음
- **완전 무중단 운영 필요시**: Railway($5/월) 검토

### 텔레그램 봇 정보
- 봇 사용자명: `@ganara111bot`
- 봇 ID: `YOUR_BOT_ID`
- 통신 방식: Polling (1초 간격)

### 노션 데이터베이스
- 데이터베이스 ID: `2ec72625-11a3-81f5-9d25-cc5990dec3d7`
- Integration: 이미 연결됨

---

## 🚨 문제 해결 가이드

### ES Module 오류
```
ReferenceError: require is not defined in ES module scope
```
**해결**: `package.json`에서 `"type": "module"` 줄 삭제

### 409 Conflict 오류
```
ETELEGRAM: 409 Conflict: terminated by other getUpdates request
```
**원인**: 로컬 + Replit 동시 실행
**해결**: 로컬에서 `taskkill /F /IM node.exe` 실행

### 봇이 응답하지 않음
1. Replit Shell에서 봇 실행 중인지 확인
2. Secrets에 환경 변수 4개 모두 있는지 확인
3. UptimeRobot 상태 확인
4. 로컬에서 node.exe가 실행 중이면 종료 (충돌 방지)
