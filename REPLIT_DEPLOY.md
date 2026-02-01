# 🚀 Replit 무료 배포 가이드 (24시간 실행)

이 가이드를 따라하면 **완전 무료**로 텔레그램 봇을 24시간 실행할 수 있습니다!

---

## 📋 준비물

- ✅ Replit 계정 (무료)
- ✅ UptimeRobot 계정 (무료)
- ✅ 환경 변수 값 (아래 참조)

---

## 🔐 환경 변수 (복사해두세요!)

배포 시 다음 값들을 사용합니다:

```
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
NOTION_TOKEN=YOUR_NOTION_TOKEN_HERE
NOTION_DATABASE_ID=YOUR_DATABASE_ID_HERE
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE
```

⚠️ **주의**: 이 값들은 절대 GitHub에 올리지 마세요! (`.gitignore`에 `.env` 포함됨)

---

## 📦 Step 1: Replit 계정 생성 및 프로젝트 만들기

### 1-1. Replit 가입
1. https://replit.com 접속
2. **"Sign up"** 클릭
3. **GitHub 계정으로 로그인** (권장) 또는 이메일로 가입

### 1-2. 새 Repl 생성
1. 로그인 후 우측 상단 **"+ Create Repl"** 클릭
2. Template: **"Node.js"** 선택
3. Title: `telegram-notion-bot` 입력
4. **"+ Create Repl"** 클릭

---

## 📁 Step 2: 파일 업로드

### 2-1. 기존 파일 삭제
Replit 에디터 좌측 Files 패널에서:
- `index.js` 파일 우클릭 → **Delete** 클릭

### 2-2. 프로젝트 파일 업로드
다음 파일들을 **드래그 앤 드롭**으로 업로드:

**필수 파일:**
- ✅ `bot.js` (메인 봇 코드)
- ✅ `package.json` (의존성 정의)

**선택 파일:**
- `README.md` (프로젝트 설명)
- `.gitignore` (Git 제외 파일)

⚠️ **주의**: `.env` 파일은 업로드하지 마세요! (보안 위험)

---

## 🔒 Step 3: 환경 변수 설정 (매우 중요!)

### 3-1. Secrets 메뉴 열기
1. 좌측 메뉴에서 **🔒 "Secrets"** 아이콘 클릭 (자물쇠 모양)
2. "Got it" 클릭 (처음 사용 시)

### 3-2. 환경 변수 추가
**"+ New Secret"** 버튼을 클릭하여 다음 4개 변수를 **하나씩** 추가:

#### 변수 1: Telegram Bot Token
```
Key: TELEGRAM_BOT_TOKEN
Value: YOUR_BOT_TOKEN_HERE
```

#### 변수 2: Notion Token
```
Key: NOTION_TOKEN
Value: YOUR_NOTION_TOKEN_HERE
```

#### 변수 3: Notion Database ID
```
Key: NOTION_DATABASE_ID
Value: 2ec72625-11a3-81f5-9d25-cc5990dec3d7
```

#### 변수 4: Claude API Key
```
Key: ANTHROPIC_API_KEY
Value: YOUR_ANTHROPIC_API_KEY_HERE
```

### 3-3. 확인
- 총 4개의 Secret이 추가되었는지 확인
- 각 Key 이름에 오타가 없는지 확인

---

## ▶️ Step 4: 봇 실행하기

### 4-1. 실행
1. 상단의 **"Run"** 버튼 클릭 (초록색 재생 버튼 ▶️)
2. Replit이 자동으로 `npm install` 실행 (1-2분 소요)
3. Console 탭에서 다음 메시지 확인:

```
✅ Environment variables loaded
✅ Bot initialized
✅ Notion client initialized
✅ Claude API initialized
🌐 웹 서버가 포트 3000에서 실행 중입니다.
💡 슬립 모드 방지를 위해 UptimeRobot을 설정하세요!
🎉 Bot is now running and listening for messages!
```

### 4-2. 테스트
1. 텔레그램 앱 열기
2. `@ganara111bot` 검색
3. `/start` 전송
4. 봇이 응답하면 성공! ✅

---

## 🌐 Step 5: Repl URL 확인

### 5-1. Webview 열기
1. Replit 상단에 **"Webview"** 탭 클릭
2. 브라우저에 다음과 같은 JSON이 표시됨:

```json
{
  "status": "alive",
  "bot": "Telegram Notion Bot",
  "uptime": 123.456,
  "timestamp": "2026-01-21T06:30:00.000Z"
}
```

### 5-2. URL 복사
1. Webview 주소창의 URL 복사
2. 형식: `https://telegram-notion-bot.your-username.repl.co`
3. **메모장에 저장** (다음 단계에서 사용)

---

## 🤖 Step 6: UptimeRobot 설정 (슬립 모드 방지)

이제 5분마다 자동으로 봇을 깨우는 무료 서비스를 설정합니다!

### 6-1. UptimeRobot 가입
1. https://uptimerobot.com 접속
2. **"Free Sign Up"** 클릭
3. 이메일로 가입 (무료!)
4. 이메일 인증 완료

### 6-2. 모니터 추가
1. 로그인 후 **"+ Add New Monitor"** 클릭
2. 다음과 같이 설정:

```
Monitor Type: HTTP(s)
Friendly Name: Telegram Notion Bot
URL (or IP): https://telegram-notion-bot.your-username.repl.co
             ↑ Step 5-2에서 복사한 URL 붙여넣기
Monitoring Interval: 5 minutes
```

3. **"Create Monitor"** 클릭

### 6-3. 확인
- Dashboard에 **초록색 "Up"** 표시가 나타나면 성공! ✅
- 이제 UptimeRobot이 5분마다 자동으로 봇을 깨웁니다!

---

## ✅ Step 7: 최종 테스트

### 7-1. 즉시 테스트
1. 텔레그램에서 `@ganara111bot`에게 `/start` 전송
2. 봇이 응답하는지 확인 ✅

### 7-2. 메시지 포워딩 테스트
1. 아무 채널/그룹의 메시지를 봇으로 포워드
2. "⏳ 처리 중..." → "✅ 저장 완료!" 메시지 확인
3. 노션 데이터베이스에 새 항목이 생성되었는지 확인

### 7-3. 슬립 모드 방지 확인 (1시간 후)
1. 1시간 후에 다시 메시지 전송
2. 즉시 응답하면 성공! (슬립 모드 없음)

---

## 🎉 완료!

축하합니다! 이제 완전 무료로 24시간 봇이 실행됩니다!

### 📊 비용 요약
| 서비스 | 비용 |
|--------|------|
| Replit | **무료** |
| UptimeRobot | **무료** |
| **총 비용** | **₩0** |

---

## 🔧 추가 설정 (선택사항)

### Replit에서 .replit 파일 생성

Replit이 자동으로 올바른 명령어를 실행하도록 설정:

1. Replit에서 새 파일 생성: `.replit`
2. 다음 내용 입력:

```toml
run = "npm start"
entrypoint = "bot.js"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "npm start"]
```

---

## 📱 모니터링 방법

### Replit에서 로그 확인
1. Replit Console 탭에서 실시간 로그 확인
2. 에러가 발생하면 빨간색으로 표시됨

### UptimeRobot에서 상태 확인
1. https://uptimerobot.com 로그인
2. Dashboard에서 "Up" 상태 확인
3. 다운타임 발생 시 이메일 알림 (무료!)

---

## 🐛 문제 해결

### 문제 1: "Module 'express' not found"
**원인**: `package.json`에 express가 없음

**해결**: Replit Shell에서 실행
```bash
npm install express
```

### 문제 2: 봇이 응답하지 않음
**체크리스트**:
- ✅ Replit Console에 "🎉 Bot is now running" 메시지가 있는가?
- ✅ Secrets에 4개 환경 변수가 모두 설정되었는가?
- ✅ 환경 변수 값에 오타가 없는가?
- ✅ 로컬에서 같은 봇이 실행 중이지 않은가?

**해결**: 
1. Replit에서 "Stop" 버튼 클릭
2. 5초 대기
3. "Run" 버튼 다시 클릭

### 문제 3: UptimeRobot이 "Down" 표시
**원인**: Replit URL이 잘못되었거나 봇이 중단됨

**해결**:
1. Replit에서 봇이 실행 중인지 확인
2. Webview 탭에서 URL 다시 복사
3. UptimeRobot에서 Monitor 수정 (Edit)
4. URL 다시 입력

### 문제 4: "409 Conflict" 에러
**원인**: 로컬에서도 봇이 실행 중

**해결**: 로컬 봇 중단
```powershell
taskkill /F /IM node.exe
```

### 문제 5: Claude API 에러
**원인**: API 크레딧 부족 또는 키 오류

**해결**:
1. https://console.anthropic.com 에서 크레딧 확인
2. API 키가 올바른지 확인
3. Secrets에서 `ANTHROPIC_API_KEY` 값 재확인

---

## 🎯 다음 단계

배포가 완료되었다면:

1. ✅ **로컬 봇 중단** (Replit과 충돌 방지)
2. ✅ **UptimeRobot 설정 확인** (5분마다 핑)
3. ✅ **노션 데이터베이스 확인** (메시지가 잘 저장되는지)
4. ✅ **친구들에게 공유** (`@ganara111bot` 사용법 알려주기)

---

## 📞 도움이 필요하신가요?

- Replit 문서: https://docs.replit.com
- UptimeRobot 문서: https://uptimerobot.com/help
- 텔레그램 봇 API: https://core.telegram.org/bots/api

---

**작성일**: 2026-01-21  
**버전**: 1.0  
**상태**: ✅ 테스트 완료
