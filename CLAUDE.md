# Telegram → Notion 자동 저장 봇

텔레그램 메시지를 Claude AI로 분석하여 Notion 데이터베이스에 자동 저장하는 봇

---

## 프로젝트 상태

- ✅ **운영 중**: Replit 24/7 배포 (https://node-suite--tlsl111009.replit.app)
- ✅ **모든 문제 해결 완료**: 중복 저장 문제, 이벤트 리스너 중복 등록 문제 해결
- ✅ **테스트 통과**: 26개 단위 테스트 전체 통과
- ✅ **모니터링**: UptimeRobot으로 5분 간격 헬스체크

---

## 기술 스택

- **런타임**: Node.js 20
- **봇 프레임워크**: node-telegram-bot-api (polling 방식)
- **API 클라이언트**: @notionhq/client (Notion), @anthropic-ai/sdk (Claude)
- **웹 서버**: Express (헬스체크용)
- **테스트**: Jest (26개 단위 테스트)
- **배포**: Replit (무료 플랜)

---

## 주요 명령어

```bash
npm start          # 봇 실행 (프로덕션)
npm run dev        # 개발 모드 (hot reload)
npm test           # 테스트 실행 (26개)
npm run test:watch # 테스트 watch 모드
```

---

## 핵심 파일 구조

```
telegram_resource/
├── bot.js                    # 메인 봇 로직 (로컬 & Replit 공용)
├── dedup-store.js            # 파일 기반 중복 방지 저장소
├── check-uptime.js           # UptimeRobot 연결 확인
├── package.json              # 의존성 관리
├── jest.config.js            # Jest 테스트 설정
│
├── tests/
│   ├── setup.js              # NODE_ENV=test 설정
│   └── unit/                 # 단위 테스트 (26개)
│       ├── parseMessage.test.js
│       ├── getContentHash.test.js
│       ├── isDuplicate.test.js
│       └── getMessageUrl.test.js
│
├── diagnosis/                # 진단 스크립트
│   ├── test-diagnosis-telegram.js
│   ├── test-diagnosis-claude.js
│   └── test-diagnosis-claude-v2.js
│
├── HANDOFF.md                # 프로젝트 인수인계 (상세)
├── FINAL_SUMMARY_20260201.md # 최종 완료 요약
└── README.md                 # 프로젝트 개요
```

---

## 코드 규칙

### 커밋 메시지
- 한글로 작성
- 형식: `Fix: 문제 설명` 또는 `Add: 기능 설명`

### 코딩 스타일
- CommonJS 모듈 시스템 (`require`, `module.exports`)
- 콘솔 로그에 접두사 사용: `[HANDLER]`, `[DEDUP]`, `[DIAGNOSIS]`
- 환경변수는 `.env` 파일 사용 (gitignore 대상)

### 테스트
- 코드 수정 시 `npm test` 실행 필수
- 테스트가 깨지면 커밋 금지

---

## 핵심 아키텍처

### 메시지 처리 흐름
```
Telegram 메시지 수신
  ↓
중복 체크 (Message ID + Content Hash)
  ↓
메시지 파싱 (제목, 본문, URL 추출)
  ↓
Claude AI 분석 (카테고리 분류 + 한글 요약)
  ↓
Notion 데이터베이스 저장
  ↓
사용자에게 완료 알림
```

### 중복 방지 시스템 (매우 중요!)

**3단계 중복 방지**:
1. **이벤트 리스너 중복 등록 방지**
   - `bot.removeAllListeners('message')` 로 기존 리스너 제거
   - Replit 핫 리로드 환경에서 리스너 누적 방지

2. **파일 기반 영속 저장소** (`dedup-store.js`)
   - `processed_messages.json`에 처리된 메시지 저장
   - TTL: 24시간, MAX: 5000개
   - 프로세스 재시작에도 중복 방지 유지

3. **프로세스 잠금 파일** (`.bot.lock`)
   - 다중 인스턴스 실행 방지
   - 5분 TTL로 좀비 프로세스 처리

**주의**: 중복 방지 로직은 절대 수정하지 말 것! (bot.js:56-94, bot.js:112-114, bot.js:137-165)

---

## 환경 변수

### 필수 환경변수 (.env)
```
TELEGRAM_BOT_TOKEN=your_token      # 텔레그램 봇 토큰
NOTION_TOKEN=your_token            # Notion 통합 토큰
NOTION_DATABASE_ID=your_db_id     # Notion 데이터베이스 ID
ANTHROPIC_API_KEY=your_api_key    # Claude API 키
PORT=3000                          # Express 서버 포트
```

### Replit Secrets
- Replit 배포 시 Secrets 탭에서 동일한 환경변수 설정
- `.env` 파일은 로컬 개발용으로만 사용

---

## 배포 정보

### Replit
- **URL**: https://replit.com/@tlsl111009/Node-Suite
- **Public URL**: https://node-suite--tlsl111009.replit.app
- **실행 명령**: `node bot.js`
- **포트**: 3000 (Express 헬스체크)

### UptimeRobot
- **모니터 ID**: 802187687
- **체크 간격**: 5분
- **목적**: Replit 슬립 모드 방지

### GitHub
- **저장소**: https://github.com/yealu/telegram_resource_bot
- **브랜치**: main

---

## 알려진 문제와 해결책

### ✅ 해결된 문제

1. **메시지 중복 저장** (2026-02-01 해결)
   - 원인: 이벤트 리스너 중복 등록 (Replit 핫 리로드)
   - 해결: `bot.removeAllListeners()` 추가

2. **프로세스 재시작 시 중복 처리** (2026-02-01 해결)
   - 원인: 메모리 기반 중복 체크
   - 해결: 파일 기반 영속 저장소 구현

3. **다중 인스턴스 충돌** (2026-02-01 해결)
   - 원인: 로컬 + Replit 동시 실행
   - 해결: 프로세스 잠금 파일 (.bot.lock)

---

## 중요 참고 문서

1. **HANDOFF.md** - 전체 작업 이력과 상세한 문제 해결 과정
2. **FINAL_SUMMARY_20260201.md** - 최종 완료 요약
3. **DUPLICATE_FIX_SUMMARY.md** - 중복 문제 해결 상세 분석
4. **REPLIT_DEPLOY.md** - Replit 배포 가이드
5. **UPTIME_CHECK.md** - UptimeRobot 연동 가이드

---

## 코드 수정 시 주의사항

### 절대 건드리지 말 것
- `bot.removeAllListeners()` 로직 (bot.js:112-114)
- 중복 방지 시스템 전체 (dedup-store.js, .bot.lock 관련 코드)
- Telegram polling 설정 (`timeout: 60`)

### 수정 전 필수 확인
- 모든 테스트 통과 (`npm test`)
- 진단 로깅으로 동작 확인 (`[DIAGNOSIS]` 로그)
- Replit에서 실제 테스트

### 문제 발생 시
1. Replit Console에서 `[DIAGNOSIS]` 로그 확인
2. 메시지 수신 횟수와 message_id 확인
3. `npm test`로 기능 테스트
4. 필요시 진단 스크립트 실행 (`diagnosis/` 폴더)

---

## Express 서버

### 용도
- UptimeRobot 헬스체크 엔드포인트
- Replit 슬립 모드 방지

### 엔드포인트
- `GET /` - 헬스체크 (200 OK 응답)

### 중요
- 테스트 환경에서는 서버 실행 안 함 (`NODE_ENV=test`)
- 프로덕션에서만 포트 3000으로 실행

---

## 봇 사용법

1. **텔레그램 봇**: @ganara111bot
2. **메시지 전송**: 봇에게 직접 메시지 전송 또는 포워드
3. **응답**: "⏳ 처리 중..." → "✅ 저장 완료!"
4. **Notion 확인**: 데이터베이스에 자동 저장됨

---

**마지막 업데이트**: 2026-02-01
**다음 작업**: 없음 (모든 작업 완료)
