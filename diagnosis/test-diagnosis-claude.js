/**
 * 테스트 2: Claude API 요약 진단
 * 
 * 목적: Claude API가 한 번의 호출로 한 개의 응답만 반환하는지,
 *       영문+한글 두 개의 요약을 반환하는지 확인
 * 
 * 실행 방법:
 * 1. node test-diagnosis-claude.js
 * 2. 콘솔 로그 확인
 */

require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.");
    process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// 테스트용 샘플 텍스트 (영문)
const sampleTextEnglish = `
OpenAI has just announced GPT-5, their most advanced AI model yet. 
The new model shows significant improvements in reasoning, creativity, and factual accuracy.
Industry experts predict this will revolutionize how businesses operate.
`;

// 테스트용 샘플 텍스트 (한글)
const sampleTextKorean = `
국내 AI 스타트업이 대규모 투자를 유치했습니다.
이번 투자로 인해 글로벌 시장 진출이 가속화될 전망입니다.
전문가들은 한국 AI 산업의 성장 가능성을 높이 평가하고 있습니다.
`;

// 현재 replit_bot.js에서 사용하는 것과 동일한 프롬프트
const CURRENT_PROMPT = `아래 텍스트를 분석해서 카테고리와 요약을 생성하세요.

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
`;

async function testClaudeAnalysis(text, label) {
    console.log("\n" + "=".repeat(60));
    console.log(`🔬 테스트: ${label}`);
    console.log("=".repeat(60));
    console.log(`📝 입력 텍스트:\n${text.substring(0, 100)}...`);
    console.log("-".repeat(60));

    try {
        const startTime = Date.now();

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: CURRENT_PROMPT + text,
                },
            ],
        });

        const endTime = Date.now();
        const responseText = message.content[0].text;

        console.log(`\n⏱️ 응답 시간: ${endTime - startTime}ms`);
        console.log(`\n📤 Claude 원본 응답:`);
        console.log("-".repeat(40));
        console.log(responseText);
        console.log("-".repeat(40));

        // 응답 분석
        console.log("\n🔍 응답 분석:");

        // 1. JSON 개수 확인
        const jsonMatches = responseText.match(/\{[\s\S]*?\}/g);
        console.log(`  - JSON 객체 개수: ${jsonMatches ? jsonMatches.length : 0}`);

        if (jsonMatches && jsonMatches.length > 1) {
            console.log("  ⚠️ 경고: 여러 개의 JSON이 반환되었습니다!");
            jsonMatches.forEach((json, i) => {
                console.log(`\n    [JSON ${i + 1}]: ${json}`);
            });
        }

        // 2. 첫 번째 JSON 파싱
        if (jsonMatches && jsonMatches.length > 0) {
            const parsed = JSON.parse(jsonMatches[0]);
            console.log(`\n  📊 파싱된 결과:`);
            console.log(`    - category: ${parsed.category}`);
            console.log(`    - summary: ${parsed.summary}`);

            // 3. summary 언어 확인
            const hasKorean = /[가-힣]/.test(parsed.summary);
            const hasEnglish = /[a-zA-Z]/.test(parsed.summary);

            console.log(`\n  🌐 요약 언어 분석:`);
            console.log(`    - 한글 포함: ${hasKorean ? "✅ 예" : "❌ 아니오"}`);
            console.log(`    - 영문 포함: ${hasEnglish ? "✅ 예" : "❌ 아니오"}`);

            if (!hasKorean && hasEnglish) {
                console.log("  ⚠️ 경고: 요약이 영문으로만 작성되었습니다!");
            } else if (hasKorean && hasEnglish) {
                console.log("  ℹ️ 정보: 요약에 한글과 영문이 혼합되어 있습니다.");
            } else if (hasKorean && !hasEnglish) {
                console.log("  ✅ 정상: 요약이 한글로만 작성되었습니다.");
            }
        }

        return {
            success: true,
            responseText,
            jsonCount: jsonMatches ? jsonMatches.length : 0,
        };

    } catch (error) {
        console.error(`❌ Claude API 오류:`, error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

async function runDiagnosis() {
    console.log("=".repeat(60));
    console.log("🔬 Claude API 요약 진단 테스트");
    console.log("=".repeat(60));
    console.log("📝 현재 프롬프트로 영문/한글 텍스트 두 가지를 테스트합니다.");
    console.log("📝 각 호출에서 JSON 응답이 몇 개 반환되는지 확인합니다.");

    // 테스트 1: 영문 텍스트
    const result1 = await testClaudeAnalysis(sampleTextEnglish, "영문 텍스트 → 한글 요약");

    // 테스트 2: 한글 텍스트
    const result2 = await testClaudeAnalysis(sampleTextKorean, "한글 텍스트 → 한글 요약");

    // 결과 요약
    console.log("\n\n" + "=".repeat(60));
    console.log("📊 진단 결과 요약");
    console.log("=".repeat(60));

    console.log("\n🔍 문제 진단:");

    if (result1.jsonCount > 1 || result2.jsonCount > 1) {
        console.log("  ⚠️ Claude API가 여러 개의 JSON을 반환하고 있습니다!");
        console.log("  → 이것이 중복 노션 저장의 원인일 수 있습니다.");
        console.log("  → 해결책: JSON 파싱 시 첫 번째 결과만 사용하도록 수정");
    } else {
        console.log("  ✅ Claude API는 각 호출당 하나의 JSON만 반환합니다.");
        console.log("  → 중복 노션 저장 문제는 Claude API 단계가 아닌 것으로 보입니다.");
    }

    console.log("\n💡 다음 단계:");
    console.log("  1. test-diagnosis-telegram.js로 텔레그램 수신 테스트");
    console.log("  2. 실제 포워드 시 메시지가 몇 번 수신되는지 확인");

    console.log("\n" + "=".repeat(60));
    console.log("🛑 테스트 완료");
}

runDiagnosis();
