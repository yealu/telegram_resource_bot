# 📝 README

## 텔레그램 → 노션 자동 저장 봇

텔레그램에서 받은 메시지를 자동으로 노션 데이터베이스에 저장하는 봇입니다.

---

## 🎉 현재 상태

- ✅ **24시간 운영 중**: Replit + UptimeRobot
- ✅ **중복 저장 문제 해결 완료**
- ✅ **실시간 모니터링**: UptimeRobot 대시보드

---

## 🚀 주요 기능

1. **텔레그램 메시지 수신**
   - 포워드된 메시지 지원
   - 텍스트, 캡션 자동 파싱

2. **AI 분석** (Claude API)
   - 자동 카테고리 분류
   - 한국어 요약 생성

3. **노션 자동 저장**
   - 제목, 내용, 카테고리, 요약
   - 원본 링크 포함

4. **중복 방지**
   - Message ID 기반 중복 체크
   - Content Hash 기반 중복 체크

---

## 🌐 배포 정보

### Replit
- **URL**: https://node-suite--tlsl111009.replit.app
- **프로젝트**: Node-Suite
- **상태**: Public (배포 완료)

### UptimeRobot
- **모니터링 간격**: 5분
- **Uptime**: 100%
- **슬립 모드 방지**: 활성화

---

## 📁 파일 구조

```
telegram_resource/
├── bot.js                          # 로컬 개발용 봇
├── replit_bot.js                   # Replit 배포용 봇
├── .replit                         # Replit 설정
├── package.json                    # 의존성
├── .env                           # 환경 변수 (로컬)
│
├── diagnosis/                      # 진단 파일
│   ├── README.md
│   ├── test-diagnosis-telegram.js
│   ├── test-diagnosis-claude.js
│   └── test-diagnosis-claude-v2.js
│
├── HANDOFF.md                      # 프로젝트 인수인계
├── UPTIME_CHECK.md                 # UptimeRobot 연동 확인
├── REPLIT_DEPLOY.md                # Replit 배포 가이드
├── FINAL_SUMMARY_20260201.md       # 최종 완료 요약
│
└── check-uptime.js                 # Replit URL 확인 스크립트
```

---

## 🔧 환경 변수

### Replit Secrets에 설정된 변수:
```
TELEGRAM_BOT_TOKEN=your_token
NOTION_TOKEN=your_token
NOTION_DATABASE_ID=your_database_id
ANTHROPIC_API_KEY=your_api_key
PORT=3000
```

---

## 📊 모니터링

- **UptimeRobot**: https://uptimerobot.com
- **Replit Console**: https://replit.com/@tlsl111009/Node-Suite
- **봇 상태**: https://node-suite--tlsl111009.replit.app

---

## 🧪 테스트

### 봇 테스트
1. 텔레그램에서 봇에게 메시지 전송
2. 봇이 "⏳ 처리 중..." 응답
3. 분석 완료 후 "✅ 저장 완료!" 응답
4. 노션에서 저장된 페이지 확인

### 슬립 모드 방지 테스트
1. 1시간 동안 아무 작업도 하지 않기
2. 1시간 후 메시지 전송
3. 5초 이내 응답 확인

---

## 🐛 문제 해결

### 봇이 응답하지 않을 때
1. Replit Console에서 로그 확인
2. UptimeRobot에서 모니터 상태 확인
3. Replit에서 "Run" 버튼 클릭 (재시작)

### 중복 저장이 발생할 때
1. Replit Console에서 `[DIAGNOSIS]` 로그 확인
2. message_id 중복 여부 확인
3. 필요 시 진단 스크립트 실행

---

## 📚 문서

- **HANDOFF.md**: 프로젝트 전체 현황
- **FINAL_SUMMARY_20260201.md**: 최종 완료 요약
- **UPTIME_CHECK.md**: UptimeRobot 연동 확인
- **REPLIT_DEPLOY.md**: Replit 배포 가이드
- **diagnosis/README.md**: 진단 파일 설명

---

## 📞 지원

문제가 발생하면 다음 문서를 참고하세요:
1. **FINAL_SUMMARY_20260201.md** - 전체 설정 확인
2. **HANDOFF.md** - 프로젝트 현황
3. **diagnosis/README.md** - 진단 방법

---

**최종 업데이트**: 2026-02-01 00:06  
**상태**: 🎉 모든 작업 완료!
