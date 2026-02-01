/**
 * Claude API 연결 테스트
 * 실행: node test-claude.js
 */
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function testClaudeAPI() {
  console.log('🔍 Claude API 연결 테스트 시작...\n');

  // API 키 확인
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY가 .env에 설정되지 않았습니다.');
    process.exit(1);
  }

  console.log(`📌 API 키: ${ANTHROPIC_API_KEY.substring(0, 20)}...`);

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // 테스트 텍스트
  const testText = `
AI 기술의 발전과 미래

최근 인공지능 기술이 급속도로 발전하면서 다양한 산업에 혁신을 가져오고 있습니다.
특히 대형 언어 모델(LLM)의 등장으로 자연어 처리 분야에서 놀라운 성과를 보이고 있습니다.
GPT, Claude, Gemini 등의 모델들이 실생활에 적용되고 있습니다.
  `.trim();

  console.log('\n--- 테스트 텍스트 ---');
  console.log(testText.substring(0, 100) + '...\n');

  try {
    console.log('🤖 Claude API 호출 중...');

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `당신은 텍스트 분류 및 요약 전문가입니다.

주어진 텍스트를 분석하여 다음을 수행하세요:

1. **카테고리 분류**: 아래 카테고리 중 가장 적합한 하나를 선택
   - AI/ML: 인공지능, 머신러닝, 딥러닝, LLM 관련
   - 개발: 프로그래밍, 소프트웨어 개발, 코딩 관련
   - 디자인: UI/UX, 그래픽, 제품 디자인 관련
   - 비즈니스: 경영, 마케팅, 스타트업, 투자 관련
   - 생산성: 업무 효율, 도구, 자기계발 관련
   - 뉴스: 시사, 경제, 정치, 사회 이슈
   - 기타: 위 카테고리에 해당하지 않는 경우

2. **간단 요약**: 핵심 내용을 2-3문장으로 요약

반드시 아래 JSON 형식으로만 응답하세요:
{"category": "카테고리명", "summary": "요약 내용"}

---
분석할 텍스트:
${testText}`
        }
      ]
    });

    const responseText = message.content[0].text;
    console.log('\n✅ API 호출 성공!\n');
    console.log('--- 응답 내용 ---');
    console.log(responseText);

    // JSON 파싱 테스트
    console.log('\n--- JSON 파싱 테스트 ---');
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ JSON 파싱 성공!');
      console.log(`   - 카테고리: ${parsed.category}`);
      console.log(`   - 요약: ${parsed.summary}`);
    } else {
      console.error('❌ JSON 형식을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('\n❌ Claude API 호출 실패!');
    console.error(`   오류: ${error.message}`);

    if (error.status === 401) {
      console.error('\n⚠️ API 키가 유효하지 않습니다.');
      console.error('   https://console.anthropic.com/settings/keys 에서 새 키를 발급받으세요.');
    }
  }
}

testClaudeAPI();
