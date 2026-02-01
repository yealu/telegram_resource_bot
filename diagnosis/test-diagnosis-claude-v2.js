/**
 * 테스트 2: Claude API 요약 진단 (로그 파일 버전)
 * 
 * 목적: Claude API가 한 번의 호출로 한 개의 응답만 반환하는지,
 *       영문+한글 두 개의 요약을 반환하는지 확인
 * 
 * 실행 방법:
 * 1. node test-diagnosis-claude-v2.js
 * 2. diagnosis_claude_result.json 파일 확인
 */

require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
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
    const result = {
        label,
        inputText: text.substring(0, 100) + "...",
        success: false,
        responseTime: 0,
        rawResponse: "",
        jsonCount: 0,
        parsedResults: [],
        summaryAnalysis: {},
        warnings: [],
    };

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

        result.success = true;
        result.responseTime = endTime - startTime;
        result.rawResponse = responseText;

        // JSON 개수 확인
        const jsonMatches = responseText.match(/\{[\s\S]*?\}/g);
        result.jsonCount = jsonMatches ? jsonMatches.length : 0;

        if (jsonMatches && jsonMatches.length > 1) {
            result.warnings.push("MULTIPLE_JSON_RETURNED");
        }

        // 모든 JSON 파싱
        if (jsonMatches) {
            jsonMatches.forEach((json, i) => {
                try {
                    const parsed = JSON.parse(json);
                    result.parsedResults.push({
                        index: i,
                        category: parsed.category,
                        summary: parsed.summary,
                    });
                } catch (e) {
                    result.parsedResults.push({
                        index: i,
                        error: "Parse error: " + e.message,
                    });
                }
            });
        }

        // 첫 번째 결과 언어 분석
        if (result.parsedResults.length > 0 && result.parsedResults[0].summary) {
            const summary = result.parsedResults[0].summary;
            const hasKorean = /[가-힣]/.test(summary);
            const hasEnglish = /[a-zA-Z]/.test(summary);

            result.summaryAnalysis = {
                hasKorean,
                hasEnglish,
                language: hasKorean && !hasEnglish ? "KOREAN_ONLY" :
                    !hasKorean && hasEnglish ? "ENGLISH_ONLY" :
                        hasKorean && hasEnglish ? "MIXED" : "UNKNOWN",
            };

            if (!hasKorean && hasEnglish) {
                result.warnings.push("SUMMARY_IS_ENGLISH_ONLY");
            }
        }

    } catch (error) {
        result.error = error.message;
    }

    return result;
}

async function runDiagnosis() {
    console.log("Starting Claude API diagnosis...");

    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {},
    };

    // 테스트 1: 영문 텍스트
    console.log("Test 1: English text...");
    const result1 = await testClaudeAnalysis(sampleTextEnglish, "English_to_Korean");
    results.tests.push(result1);

    // 테스트 2: 한글 텍스트
    console.log("Test 2: Korean text...");
    const result2 = await testClaudeAnalysis(sampleTextKorean, "Korean_to_Korean");
    results.tests.push(result2);

    // 결과 요약
    const hasMultipleJson = results.tests.some(t => t.jsonCount > 1);
    const hasEnglishSummary = results.tests.some(t =>
        t.summaryAnalysis && t.summaryAnalysis.language === "ENGLISH_ONLY"
    );

    results.summary = {
        totalTests: results.tests.length,
        successfulTests: results.tests.filter(t => t.success).length,
        hasMultipleJsonIssue: hasMultipleJson,
        hasEnglishSummaryIssue: hasEnglishSummary,
        diagnosis: [],
    };

    if (hasMultipleJson) {
        results.summary.diagnosis.push("ISSUE: Claude API returns multiple JSON objects - this could cause duplicate Notion entries");
    }

    if (hasEnglishSummary) {
        results.summary.diagnosis.push("ISSUE: Summary is in English instead of Korean");
    }

    if (!hasMultipleJson && !hasEnglishSummary) {
        results.summary.diagnosis.push("OK: Claude API appears to be working correctly");
        results.summary.diagnosis.push("NEXT: Run test-diagnosis-telegram.js to check Telegram message handling");
    }

    // 결과 저장
    fs.writeFileSync(
        "diagnosis_claude_result.json",
        JSON.stringify(results, null, 2)
    );

    console.log("Diagnosis complete. Results saved to diagnosis_claude_result.json");
    console.log("Summary:", JSON.stringify(results.summary, null, 2));
}

runDiagnosis();
