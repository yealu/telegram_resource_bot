/**
 * Replit 환경 진단 스크립트
 * 실행: node diagnosis/full_check.js
 */
require('dotenv').config();
const fs = require('fs');
const https = require('https');
const { Client } = require('@notionhq/client');
const Anthropic = require('@anthropic-ai/sdk');

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve({ ok: res.statusCode === 200, status: res.statusCode });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.end();
  });
}

async function runDiagnosis() {
  console.log('🏥 Replit 환경 진단 리포트\n');
  const report = {};

  // 1. 환경 변수 확인
  console.log('1️⃣ 환경 변수 점검');
  const requiredEnv = ['TELEGRAM_BOT_TOKEN', 'NOTION_TOKEN', 'NOTION_DATABASE_ID', 'ANTHROPIC_API_KEY'];
  report.env = {};
  let envOk = true;
  for (const key of requiredEnv) {
    const exists = !!process.env[key];
    report.env[key] = exists;
    console.log(`   - ${key}: ${exists ? '✅ 설정됨' : '❌ 미설정'}`);
    if (!exists) envOk = false;
  }
  if (!envOk) console.warn('   ⚠️ 일부 환경 변수가 누락되었습니다!');

  // 2. 잠금 파일 확인
  console.log('\n2️⃣ 프로세스 잠금 파일 점검');
  const lockFile = './.bot.lock';
  if (fs.existsSync(lockFile)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(lockFile, 'utf-8'));
      const age = (Date.now() - lockData.timestamp) / 1000 / 60; //분
      console.log(`   ⚠️ 잠금 파일 존재함 (PID: ${lockData.pid}, ${age.toFixed(1)}분 전 생성)`);
      report.lockFile = { exists: true, ageMinutes: age };
    } catch (e) {
      console.log('   ⚠️ 잠금 파일 존재하지만 읽을 수 없음');
    }
  } else {
    console.log('   ✅ 잠금 파일 없음 (정상)');
    report.lockFile = { exists: false };
  }

  // 3. 외부 연결 테스트
  console.log('\n3️⃣ 네트워크 연결 점검');
  
  // Telegram
  console.log('   Testing Telegram API...');
  const telegramRes = await checkUrl(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
  console.log(`   - Telegram: ${telegramRes.ok ? '✅ 연결 성공' : '❌ 연결 실패 (' + (telegramRes.status || telegramRes.error) + ')'}`);

  // Notion
  console.log('   Testing Notion API...');
  let notionOk = false;
  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.databases.retrieve({ database_id: process.env.NOTION_DATABASE_ID });
    notionOk = true;
    console.log('   - Notion: ✅ 연결 성공');
  } catch (e) {
    console.log(`   - Notion: ❌ 연결 실패 (${e.message})`);
  }

  // Claude
  console.log('   Testing Claude API...');
  let claudeOk = false;
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    claudeOk = true;
    console.log('   - Claude: ✅ 연결 성공');
  } catch (e) {
    console.log(`   - Claude: ❌ 연결 실패 (${e.message})`);
  }

  console.log('\n================================');
  if (envOk && !report.lockFile.exists && telegramRes.ok && notionOk && claudeOk) {
    console.log('🎉 모든 진단 항목 통과! 봇이 실행되기에 문제가 없습니다.');
  } else {
    console.log('⚠️ 일부 항목에 문제가 있습니다. 위 로그를 확인하세요.');
    if (report.lockFile.exists) {
      console.log('💡 팁: .bot.lock 파일을 삭제하고 재시도해보세요.');
    }
  }
}

runDiagnosis();
