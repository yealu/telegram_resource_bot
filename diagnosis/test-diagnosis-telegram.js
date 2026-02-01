/**
 * 테스트 1: 텔레그램 봇 메시지 수신 진단
 * 
 * 목적: 텔레그램 봇이 한 개의 포워드된 메시지를 몇 번 수신하는지 확인
 * 
 * 실행 방법:
 * 1. node test-diagnosis-telegram.js
 * 2. 봇에게 메시지 포워드
 * 3. 콘솔 로그 확인
 */

require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN이 설정되지 않았습니다.");
    process.exit(1);
}

// 봇 초기화
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 60,
        },
    },
});

// 수신된 모든 메시지 기록
let messageCount = 0;
const receivedMessages = [];

console.log("=".repeat(60));
console.log("🔬 텔레그램 봇 메시지 수신 진단 테스트");
console.log("=".repeat(60));
console.log("📝 봇에게 메시지를 포워드하세요.");
console.log("📝 수신되는 모든 메시지가 콘솔에 출력됩니다.");
console.log("📝 30초 후 자동 종료됩니다.");
console.log("=".repeat(60));

// 모든 메시지 이벤트 캡처
bot.on("message", async (msg) => {
    messageCount++;
    const timestamp = new Date().toISOString();

    const messageInfo = {
        count: messageCount,
        timestamp,
        message_id: msg.message_id,
        chat_id: msg.chat.id,
        from: msg.from?.username || msg.from?.id,
        text: msg.text || "(없음)",
        caption: msg.caption || "(없음)",
        forward_origin: msg.forward_origin ? JSON.stringify(msg.forward_origin) : "(없음)",
        forward_from_chat: msg.forward_from_chat ? JSON.stringify(msg.forward_from_chat) : "(없음)",
        forward_from_message_id: msg.forward_from_message_id || "(없음)",
        photo: msg.photo ? `${msg.photo.length}개의 사진` : "(없음)",
        document: msg.document ? msg.document.file_name : "(없음)",
        // 전체 메시지 객체 저장 (분석용)
        raw_message: JSON.stringify(msg, null, 2),
    };

    receivedMessages.push(messageInfo);

    console.log("\n");
    console.log("🔔 " + "=".repeat(56));
    console.log(`📨 메시지 #${messageCount} 수신됨`);
    console.log("=".repeat(60));
    console.log(`  ⏰ 시간: ${timestamp}`);
    console.log(`  🆔 Message ID: ${messageInfo.message_id}`);
    console.log(`  💬 Chat ID: ${messageInfo.chat_id}`);
    console.log(`  👤 From: ${messageInfo.from}`);
    console.log(`  📝 Text: ${messageInfo.text.substring(0, 100)}${messageInfo.text.length > 100 ? "..." : ""}`);
    console.log(`  📷 Caption: ${messageInfo.caption}`);
    console.log(`  ↪️ Forward Origin: ${messageInfo.forward_origin.substring(0, 100)}...`);
    console.log(`  📸 Photo: ${messageInfo.photo}`);
    console.log(`  📎 Document: ${messageInfo.document}`);
    console.log("=".repeat(60));

    // 사용자에게 확인 메시지 전송
    await bot.sendMessage(msg.chat.id,
        `📊 메시지 수신 확인 #${messageCount}\n` +
        `Message ID: ${msg.message_id}\n` +
        `이 테스트는 진단용입니다.`
    );
});

// 30초 후 자동 종료 및 결과 출력
setTimeout(() => {
    console.log("\n\n");
    console.log("=".repeat(60));
    console.log("📊 진단 결과 요약");
    console.log("=".repeat(60));
    console.log(`총 수신된 메시지 수: ${messageCount}`);

    if (messageCount > 0) {
        console.log("\n📋 수신된 메시지 목록:");
        receivedMessages.forEach((m, i) => {
            console.log(`\n  [${i + 1}] Message ID: ${m.message_id}`);
            console.log(`      Text: ${m.text.substring(0, 50)}...`);
        });

        // 중복 Message ID 확인
        const messageIds = receivedMessages.map(m => m.message_id);
        const uniqueIds = [...new Set(messageIds)];

        console.log("\n🔍 중복 분석:");
        console.log(`  - 총 메시지: ${messageCount}`);
        console.log(`  - 고유 Message ID: ${uniqueIds.length}`);

        if (messageCount > uniqueIds.length) {
            console.log("  ⚠️ 경고: 같은 Message ID가 여러 번 수신되었습니다!");
        } else if (messageCount > 1) {
            console.log("  ⚠️ 주의: 서로 다른 Message ID로 여러 메시지가 수신되었습니다!");
            console.log("       이는 텔레그램이 하나의 포워드를 여러 메시지로 분리했을 수 있습니다.");
        } else {
            console.log("  ✅ 정상: 메시지가 한 번만 수신되었습니다.");
        }
    }

    console.log("\n📁 상세 로그는 diagnosis_result.json에 저장됩니다.");

    // 결과를 JSON 파일로 저장
    const fs = require("fs");
    fs.writeFileSync(
        "diagnosis_result.json",
        JSON.stringify(receivedMessages, null, 2)
    );

    console.log("=".repeat(60));
    console.log("🛑 테스트 종료");
    process.exit(0);
}, 30000);

// 에러 핸들링
bot.on("polling_error", (error) => {
    console.error("⚠️ Polling error:", error.message);
});

console.log("\n⏳ 테스트 대기 중... 메시지를 포워드하세요.\n");
