/**
 * 텔레그램 봇 연결 테스트
 * 실행: node test-telegram.js
 */
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function testTelegramBot() {
  console.log('🔍 텔레그램 봇 연결 테스트 시작...\n');

  // 토큰 확인
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN이 .env에 설정되지 않았습니다.');
    process.exit(1);
  }

  console.log(`📌 토큰: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);

  try {
    // getMe API 호출
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    const data = await response.json();

    if (data.ok) {
      console.log('\n✅ 봇 연결 성공!\n');
      console.log('📋 봇 정보:');
      console.log(`   - ID: ${data.result.id}`);
      console.log(`   - 이름: ${data.result.first_name}`);
      console.log(`   - 사용자명: @${data.result.username}`);
      console.log(`   - 봇 여부: ${data.result.is_bot}`);
      console.log(`\n🔗 봇 링크: https://t.me/${data.result.username}`);
    } else {
      console.error('\n❌ 봇 연결 실패!');
      console.error(`   오류: ${data.description}`);
    }

  } catch (error) {
    console.error('\n❌ API 호출 오류:', error.message);
  }
}

testTelegramBot();
