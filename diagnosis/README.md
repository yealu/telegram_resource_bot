# 🔬 진단 테스트 파일

이 폴더에는 텔레그램 봇의 중복 저장 문제를 진단하기 위한 테스트 파일들이 있습니다.

## 📁 파일 목록

### 테스트 스크립트

1. **test-diagnosis-telegram.js**
   - 텔레그램 봇이 메시지를 몇 번 수신하는지 진단
   - 포워드된 메시지의 message_id 추적
   - 30초 동안 실행 후 자동 종료

2. **test-diagnosis-claude.js**
   - Claude API 응답 진단 (콘솔 출력 버전)
   - JSON 응답 개수 확인
   - 요약 언어 분석

3. **test-diagnosis-claude-v2.js**
   - Claude API 응답 진단 (JSON 파일 출력 버전)
   - 결과를 `diagnosis_claude_result.json`에 저장
   - 영문/한글 텍스트 두 가지 테스트

### 결과 파일

4. **diagnosis_claude_result.json**
   - Claude API 테스트 결과
   - 각 테스트의 상세 분석 포함

---

## 🎯 진단 결과 요약

### Claude API 테스트 결과 ✅

```json
{
  "hasMultipleJsonIssue": false,
  "hasEnglishSummaryIssue": false,
  "diagnosis": [
    "OK: Claude API appears to be working correctly"
  ]
}
```

**결론:** Claude API는 정상 작동 중. 각 호출당 JSON 1개만 반환.

---

### 텔레그램 봇 테스트 결과 ✅

**진단 로깅 추가 후:**
- 각 포워드된 메시지가 한 번만 수신됨
- 각 메시지가 고유한 message_id를 가짐
- 중복 방지 메커니즘 정상 작동
- 노션에 한 번만 저장됨

**결론:** 중복 저장 문제 해결됨.

---

## 🔧 사용 방법

### 1. Claude API 테스트

```bash
node diagnosis/test-diagnosis-claude-v2.js
```

결과는 `diagnosis/diagnosis_claude_result.json`에 저장됩니다.

### 2. 텔레그램 봇 테스트

**주의:** Replit에서 봇이 실행 중이면 `409 Conflict` 에러 발생!

```bash
# Replit 봇 중단 후 실행
node diagnosis/test-diagnosis-telegram.js
```

30초 동안 메시지를 포워드하면 진단 정보가 콘솔에 출력됩니다.

---

## 📊 문제 해결 과정

### 예상 문제 2가지

1. **텔레그램 봇이 메시지를 두 번 수신**
   - 원인: Polling 설정 또는 네트워크 문제
   - 해결: Message ID 기반 중복 방지

2. **Claude API가 영문+한글 두 개 요약 생성**
   - 원인: JSON 파싱 문제
   - 테스트 결과: 문제 없음 (JSON 1개만 반환)

### 최종 해결책

**진단 로깅 추가:**
- 메시지 수신 시 모든 정보 출력
- 노션 저장 직전 데이터 출력
- 문제 발생 시 즉시 원인 파악 가능

---

## 🗑️ 정리 안내

이 폴더의 파일들은 진단 완료 후 삭제해도 됩니다.

**보관 권장:**
- 향후 문제 발생 시 빠른 디버깅 가능
- 다른 봇 개발 시 참고 가능

**삭제 가능:**
- 디스크 공간 절약
- 프로젝트 정리

---

**작성일**: 2026-01-31  
**상태**: ✅ 진단 완료
