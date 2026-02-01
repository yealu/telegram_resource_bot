# Security Policy

## Supported Versions

현재 지원되는 버전:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

보안 취약점을 발견하신 경우 다음 절차를 따라주세요:

### 🔒 비공개 보고

1. **Public Issue로 보고하지 마세요**
   - 보안 취약점은 공개 이슈 트래커에 올리지 마세요
   - 악의적인 사용자가 취약점을 악용할 수 있습니다

2. **GitHub Security Advisory 사용**
   - Repository의 "Security" 탭 → "Report a vulnerability" 클릭
   - 또는 프로젝트 관리자에게 직접 연락

3. **응답 시간**
   - 보고 후 24-48시간 내 응답 예정
   - 심각도에 따라 우선순위 결정

4. **책임있는 공개 (Responsible Disclosure)**
   - 취약점이 수정될 때까지 공개하지 마세요
   - 수정 후 크레딧을 드립니다

---

## Security Best Practices

### 사용자를 위한 보안 권장사항

#### 1. 환경 변수 관리
- ✅ `.env` 파일을 절대 공개 저장소에 커밋하지 마세요
- ✅ `.env.example`을 참고하여 자신의 `.env` 파일 생성
- ✅ API 키는 안전한 곳에 별도 보관

#### 2. API 키 보안
- 🔄 API 키를 정기적으로 교체하세요 (3-6개월마다)
- 🔒 API 키가 노출되었다면 즉시 재발급하세요
- 📝 사용하지 않는 API 키는 삭제하세요

#### 3. 의존성 관리
- 📦 의존성을 최신 상태로 유지하세요
- 🔍 정기적으로 `npm audit` 실행
- ⚠️ Critical/High 취약점은 즉시 해결

#### 4. 배포 환경
- 🌐 HTTPS를 사용하세요 (Webhook 사용 시)
- 🔐 환경 변수는 배포 플랫폼의 Secrets 기능 사용
- 🚫 로그에 민감 정보를 출력하지 마세요

---

## Known Security Considerations

### 1. Telegram Bot Token
- Bot Token이 노출되면 누구나 봇을 제어할 수 있습니다
- BotFather에서 즉시 토큰을 재발급하세요

### 2. Notion Integration Token
- Integration Token이 노출되면 연결된 모든 페이지에 접근 가능합니다
- Notion에서 Integration을 삭제하고 새로 생성하세요

### 3. Claude API Key
- API 키가 노출되면 크레딧이 도용될 수 있습니다
- Anthropic Console에서 키를 삭제하고 새로 생성하세요

---

## Security Updates

보안 업데이트는 다음과 같이 공지됩니다:

1. **Critical**: GitHub Security Advisory + README 업데이트
2. **High**: Release Notes에 명시
3. **Medium/Low**: CHANGELOG에 기록

---

## Automated Security

이 프로젝트는 다음 자동화된 보안 도구를 사용합니다:

- 🤖 **Dependabot**: 의존성 자동 업데이트 (권장)
- 🔍 **npm audit**: 패키지 취약점 검사
- 🛡️ **GitHub Secret Scanning**: 커밋된 시크릿 자동 감지 (공개 저장소)

---

## Contact

보안 관련 문의:
- GitHub Security Advisory (권장)
- 또는 프로젝트 Issues에 "Security" 라벨로 문의

---

**마지막 업데이트**: 2026-01-21
