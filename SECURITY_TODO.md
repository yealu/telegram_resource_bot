# 보안 점검 TODO 리스트

**프로젝트**: Telegram to Notion Auto-Save Bot  
**생성일**: 2026-01-21  
**목표**: GitHub 오픈소스 공개 전 보안 이슈 해결

---

## 🔴 Priority 1: 즉시 조치 필요 (Critical)

### 1. API 키 재발급 및 교체

#### 1.1 Telegram Bot Token 재발급
- [ ] BotFather에서 기존 봇 토큰 폐기
- [ ] 새 토큰 발급
- [ ] `.env` 파일에 새 토큰 업데이트
- [ ] 봇 정상 작동 테스트

**방법**:
```
1. Telegram에서 @BotFather 검색
2. /mybots 명령어 입력
3. @ganara111bot 선택
4. "API Token" 선택
5. "Revoke current token" 선택
6. 새 토큰 복사하여 .env 파일에 저장
```

---

#### 1.2 Notion Integration Token 재발급
- [ ] Notion에서 기존 Integration 삭제
- [ ] 새 Integration 생성
- [ ] 데이터베이스에 새 Integration 연결
- [ ] `.env` 파일에 새 토큰 업데이트
- [ ] Notion API 연결 테스트

**방법**:
```
1. https://www.notion.so/my-integrations 접속
2. 기존 Integration 삭제
3. "New integration" 클릭
4. 이름 입력 후 생성
5. "Internal Integration Token" 복사
6. Notion 데이터베이스 페이지에서 우측 상단 "..." → "연결" → 새 Integration 추가
7. .env 파일에 새 토큰 저장
```

---

#### 1.3 Claude API Key 재발급
- [ ] Anthropic Console에서 기존 키 삭제
- [ ] 새 API 키 생성
- [ ] `.env` 파일에 새 키 업데이트
- [ ] Claude API 연결 테스트

**방법**:
```
1. https://console.anthropic.com/settings/keys 접속
2. 기존 키 삭제
3. "Create Key" 클릭
4. 새 키 복사하여 .env 파일에 저장
```

---

### 2. 문서에서 실제 API 키 제거

#### 2.1 README.md 수정
- [ ] Line 38-41의 실제 API 키를 예시 값으로 교체
- [ ] 보안 주의사항 섹션 추가
- [ ] 변경 사항 확인

**교체할 내용**:
```env
# 현재 (실제 값 - 삭제 필요)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
NOTION_TOKEN=YOUR_NOTION_TOKEN_HERE
NOTION_DATABASE_ID=2ec72625-11a3-81f5-9d25-cc5990dec3d7
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE

# 변경 후 (예시 값)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
NOTION_TOKEN=YOUR_NOTION_TOKEN_HERE
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

---

#### 2.2 IMPLEMENTATION.md 수정
- [ ] Line 454의 실제 NOTION_TOKEN 제거
- [ ] 예시 값으로 교체
- [ ] 변경 사항 확인

---

### 3. 임시 파일 정리

- [ ] `tmpclaude-03b4-cwd` 파일 삭제
- [ ] `tmpclaude-3fb1-cwd` 파일 삭제
- [ ] `nul` 파일 삭제
- [ ] 삭제 확인

**명령어**:
```powershell
# PowerShell에서 실행
Remove-Item "d:\개발 작업\telegram_resource\tmpclaude-*"
Remove-Item "d:\개발 작업\telegram_resource\nul"
```

---

## 🟡 Priority 2: 권장 조치 (Medium)

### 4. 에러 핸들링 개선

#### 4.1 bot.js 에러 메시지 수정
- [ ] Line 214-216의 에러 메시지를 일반화
- [ ] 상세 에러는 콘솔 로그에만 기록
- [ ] 테스트하여 정상 작동 확인

**수정 전**:
```javascript
await bot.sendMessage(chatId,
  `❌ 오류가 발생했습니다.\n\n` +
  `오류 내용: ${error.message}\n\n` +
  `다시 시도해 주세요.`
);
```

**수정 후**:
```javascript
console.error('❌ Error details:', error); // 서버 로그에만 기록
await bot.sendMessage(chatId,
  `❌ 일시적인 오류가 발생했습니다.\n\n` +
  `잠시 후 다시 시도해 주세요.\n` +
  `문제가 계속되면 관리자에게 문의하세요.`
);
```

---

### 5. .gitignore 개선

- [ ] `.claude/` 디렉토리 추가
- [ ] `tmpclaude-*` 패턴 추가
- [ ] 변경 사항 커밋

**추가할 내용**:
```gitignore
# Claude AI temporary files
.claude/
tmpclaude-*
```

---

### 6. npm 의존성 보안 검사

#### 6.1 npm audit 실행
- [ ] `npm audit` 명령어 실행
- [ ] 발견된 취약점 확인
- [ ] 취약점 심각도 분석

#### 6.2 취약점 해결
- [ ] Critical/High 취약점 우선 해결
- [ ] `npm audit fix` 실행
- [ ] 수동 업데이트가 필요한 경우 패키지 버전 업데이트
- [ ] 업데이트 후 봇 정상 작동 테스트

---

## 🟢 Priority 3: 추가 개선사항 (Low)

### 7. 보안 문서 추가

#### 7.1 SECURITY.md 파일 생성
- [ ] 보안 정책 문서 작성
- [ ] 취약점 보고 방법 안내
- [ ] 지원되는 버전 명시
- [ ] 파일 생성 및 커밋

**템플릿**:
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

보안 취약점을 발견하신 경우:

1. **Public Issue로 보고하지 마세요**
2. [이메일 주소] 또는 GitHub Security Advisory로 비공개 보고
3. 24-48시간 내 응답 예정
4. 책임있는 공개(Responsible Disclosure) 원칙 준수

## Security Best Practices

사용자를 위한 보안 권장사항:
- `.env` 파일을 절대 공개 저장소에 커밋하지 마세요
- API 키를 정기적으로 교체하세요
- 의존성을 최신 상태로 유지하세요
```

---

#### 7.2 LICENSE 파일 추가
- [ ] MIT 라이선스 전문 작성
- [ ] 저작권 정보 추가
- [ ] 파일 생성 및 커밋

---

### 8. Git 히스토리 점검

#### 8.1 커밋 히스토리 검사
- [ ] Git 로그에서 민감 정보 검색
- [ ] `.env` 파일이 과거에 커밋되었는지 확인
- [ ] 민감 정보가 포함된 커밋 확인

**검사 명령어**:
```powershell
# API 키 패턴 검색
git log -p -S "TELEGRAM_BOT_TOKEN" --all
git log -p -S "NOTION_TOKEN" --all
git log -p -S "ANTHROPIC_API_KEY" --all

# .env 파일 커밋 히스토리 확인
git log --all --full-history -- .env
```

#### 8.2 히스토리 정리 (필요시)
- [ ] 민감 정보가 발견된 경우 히스토리 정리 방법 결정
- [ ] 새 저장소로 시작 또는 BFG Repo-Cleaner 사용
- [ ] 정리 후 확인

---

### 9. GitHub 설정

#### 9.1 Repository 설정
- [ ] Dependabot 활성화
- [ ] Security Advisories 활성화
- [ ] Code scanning 설정 (선택사항)
- [ ] Branch protection rules 설정

#### 9.2 README 개선
- [ ] 보안 배지 추가 (선택사항)
- [ ] 설치 및 설정 가이드 명확화
- [ ] 환경 변수 설정 주의사항 강조

---

## 📋 최종 체크리스트 (GitHub 공개 전)

### 필수 확인 사항
- [ ] 모든 API 키가 재발급되었고 안전하게 보관됨
- [ ] README.md에 실제 API 키가 없음
- [ ] IMPLEMENTATION.md에 실제 토큰이 없음
- [ ] .env 파일이 .gitignore에 포함됨
- [ ] .env 파일이 Git 히스토리에 없음
- [ ] 임시 파일이 모두 삭제됨
- [ ] .gitignore가 업데이트됨
- [ ] npm audit 결과 Critical/High 취약점이 없음
- [ ] 에러 핸들링이 개선됨
- [ ] SECURITY.md 파일이 존재함
- [ ] LICENSE 파일이 존재함

### 테스트 확인
- [ ] 봇이 정상적으로 시작됨
- [ ] 메시지 전송이 정상 작동함
- [ ] Notion 저장이 정상 작동함
- [ ] Claude API 분석이 정상 작동함
- [ ] 에러 처리가 정상 작동함

### 문서 확인
- [ ] README.md가 명확하고 완전함
- [ ] 설치 가이드가 정확함
- [ ] 환경 변수 설정 방법이 명확함
- [ ] 보안 주의사항이 포함됨
- [ ] 라이선스 정보가 명확함

---

## 📊 진행 상황 추적

| 항목 | 상태 | 완료일 | 비고 |
|------|------|--------|------|
| API 키 재발급 | ⏳ 대기 | - | Priority 1 |
| README.md 수정 | ⏳ 대기 | - | Priority 1 |
| IMPLEMENTATION.md 수정 | ⏳ 대기 | - | Priority 1 |
| 임시 파일 삭제 | ⏳ 대기 | - | Priority 1 |
| 에러 핸들링 개선 | ⏳ 대기 | - | Priority 2 |
| .gitignore 개선 | ⏳ 대기 | - | Priority 2 |
| npm audit | ⏳ 대기 | - | Priority 2 |
| SECURITY.md 생성 | ⏳ 대기 | - | Priority 3 |
| LICENSE 추가 | ⏳ 대기 | - | Priority 3 |
| Git 히스토리 점검 | ⏳ 대기 | - | Priority 3 |

---

## 🎯 다음 단계

1. **Priority 1 항목부터 순차적으로 진행**
2. 각 항목 완료 시 체크박스 체크
3. 테스트를 통해 정상 작동 확인
4. 모든 항목 완료 후 최종 체크리스트 확인
5. GitHub에 공개

---

**작성일**: 2026-01-21  
**최종 업데이트**: 2026-01-21
