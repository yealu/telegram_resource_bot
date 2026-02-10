require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('@notionhq/client');
const Anthropic = require('@anthropic-ai/sdk');
const { loadProcessedMessages, isMessageInStore, addMessageToStore } = require('./dedup-store');

// ============================================
// 환경 변수
// ============================================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================
// 환경 변수 설정
const SERVER_TAG = process.env.REPLIT_SLUG ? '☁️ Replit' : '💻 Local';

if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.error('❌ TELEGRAM_BOT_TOKEN이 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.error('❌ NOTION_DATABASE_ID가 설정되지 않았습니다.');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
  console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

// ============================================
// 클라이언트 초기화
// ============================================
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 300,        // 300ms (빠른 응답)
    autoStart: true,
    params: {
      timeout: 60         // 60초 long polling (Telegram 권장)
    }
  }
});
const notion = new Client({ auth: NOTION_TOKEN });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ============================================
// 프로세스 잠금 (중복 실행 방지) - 개선됨
// ============================================
const fs = require('fs');
const path = require('path');
const http = require('http'); // Self-Ping용 모듈 추가
const LOCK_FILE = path.join(__dirname, '.bot.lock');

// 프로세스 생존 확인 함수
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0); // 시그널 0은 실제로 종료하지 않고 존재 여부만 확인
    return true;
  } catch (e) {
    return false;
  }
}

// 잠금 파일 확인 및 정리
if (fs.existsSync(LOCK_FILE)) {
  try {
    const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
    const lockAge = Date.now() - lockData.timestamp;

    // PID가 실제로 실행 중인지 확인 OR 5분 이상 경과했으면 정리
    if (isProcessRunning(lockData.pid) && lockAge < 5 * 60 * 1000) {
      console.error('❌ 다른 봇 인스턴스가 이미 실행 중입니다!');
      console.error(`   PID: ${lockData.pid} (${Math.floor(lockAge / 1000)}초 전 시작)`);
      process.exit(1);
    } else {
      console.log('⚠️ 비정상 종료된 잠금 파일 발견. 정리하고 시작합니다.');
      try { fs.unlinkSync(LOCK_FILE); } catch (e) { }
    }
  } catch (e) {
    // 잠금 파일 손상됨, 삭제 후 진행
    try { fs.unlinkSync(LOCK_FILE); } catch (e) { }
  }
}

// 잠금 파일 생성
fs.writeFileSync(LOCK_FILE, JSON.stringify({
  pid: process.pid,
  timestamp: Date.now(),
  started: new Date().toISOString()
}));

// 프로세스 종료 시 잠금 파일 제거
const cleanupLock = () => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
      if (lockData.pid === process.pid) fs.unlinkSync(LOCK_FILE);
    }
  } catch (e) { }
};

process.on('exit', cleanupLock);
process.on('SIGINT', () => { cleanupLock(); process.exit(0); });
process.on('SIGTERM', () => { cleanupLock(); process.exit(0); });

// ============================================
// 메시지 중복 방지 (파일 기반 영속 저장소)
// ============================================
loadProcessedMessages();

// ============================================
// 메시지 처리 직렬 큐 (레이스 컨디션 방지)
// ============================================
let processingLock = Promise.resolve();

// ============================================
// 봇 상태 추적
// ============================================
const botStatus = {
  startTime: Date.now(),
  lastPollingError: null,
  lastMessageReceived: null,
  successfulSaves: 0,
  failedSaves: 0,
  isPolling: true
};

// ============================================
// 이벤트 리스너 중복 등록 방지
// ============================================
bot.removeAllListeners('message');
bot.removeAllListeners('polling_error');
console.log('🔄 기존 이벤트 리스너 제거 완료');

// ============================================
// Express 서버 (슬립 모드 방지용 + 상태 모니터링)
// ============================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 접속 로그 미들웨어 (UptimeRobot 확인용)
app.use((req, res, next) => {
  // 핑 요청이나 루트 요청 시 로그 출력
  if (req.path === '/' || req.path === '/ping') {
    const userAgent = req.headers['user-agent'] || 'unknown';
    // 로컬 Self-Ping은 로그를 간소화하거나 생략할 수 있음
    // UptimeRobot 등 외부 접속은 명확히 로그를 남김
    if (!req.ip.includes('127.0.0.1') && !req.ip.includes('::1')) {
      console.log(`📡 외부 핑 수신: ${req.method} ${req.path} from ${req.ip} (${userAgent})`);
    }
  }
  next();
});

// 기본 헬스 체크 (UptimeRobot용)
app.get('/', (req, res) => {
  res.json({
    status: 'alive',
    bot: 'Telegram Notion Bot',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 상세 상태 확인 (디버깅용)
app.get('/status', (req, res) => {
  res.json({
    ...botStatus,
    uptime_seconds: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      has_telegram_token: !!process.env.TELEGRAM_BOT_TOKEN,
      has_notion_token: !!process.env.NOTION_TOKEN,
      replit: !!process.env.REPLIT_SLUG
    }
  });
});

// ✅ Self-Ping 엔드포인트 (가벼운 응답)
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// ✅ Self-Ping 함수: 주기적으로 자신의 서버를 호출하여 슬립 모드 방지
function startSelfPing(url) {
  console.log(`⏰ Self-Ping 시작: ${url} (5분 간격)`);

  // 첫 실행 즉시 수행
  performPing(url);

  setInterval(() => {
    performPing(url);
  }, 5 * 60 * 1000); // 5분마다 실행
}

function performPing(url) {
  http.get(url, (res) => {
    if (res.statusCode === 200) {
      // 로그가 너무 많이 쌓이지 않도록 성공 시에는 간단히 출력하거나 생략 가능
      // console.log(`📡 Self-Ping 성공: ${res.statusCode}`);
    } else {
      console.warn(`⚠️ Self-Ping 응답 이상: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`❌ Self-Ping 실패: ${err.message}`);
  });
}

// 서버 시작 (테스트 환경이 아닐 때만 실행)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌐 웹 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`💡 슬립 모드 방지를 위해 내부 Self-Ping과 UptimeRobot을 함께 사용합니다.`);

    // Replit 환경 또는 로컬 환경 감지하여 Self-Ping 시작
    // REPLIT_DEV_DOMAIN 또는 REPLIT_SLUG 등을 확용할 수 있음 (외부 URL)
    // 여기서는 가장 확실한 localhost로 핑을 보냄 (내부 트래픽 발생)
    const pingUrl = `http://localhost:${PORT}/ping`;
    startSelfPing(pingUrl);
  });
}

// ============================================
// /start 명령어 핸들러
// ============================================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `안녕하세요! 노션 자동 저장 봇입니다. 👋\n\n` +
    `📝 사용법:\n` +
    `1. 저장하고 싶은 메시지를 이 봇에게 포워드하세요\n` +
    `2. 또는 직접 텍스트를 입력하세요\n` +
    `3. 자동으로 노션에 저장됩니다!\n\n` +
    `📌 규칙:\n` +
    `• 첫 줄 → 제목\n` +
    `• 나머지 → 본문\n` +
    `• AI가 카테고리와 요약을 자동 생성합니다\n\n` +
    `💡 /help - 도움말 보기`
  );
});

// ============================================
// /help 명령어 핸들러
// ============================================
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `📚 도움말\n\n` +
    `✅ 사용 가능한 명령어:\n` +
    `/start - 봇 시작 및 사용법 안내\n` +
    `/help - 도움말 보기\n\n` +
    `📝 메시지를 보내면 자동으로 노션에 저장됩니다.\n\n` +
    `🔍 카테고리:\n` +
    `• AI/ML - 인공지능, 머신러닝\n` +
    `• 개발 - 프로그래밍, 소프트웨어\n` +
    `• 디자인 - UI/UX, 그래픽\n` +
    `• 비즈니스 - 경영, 마케팅\n` +
    `• 생산성 - 업무 효율, 도구\n` +
    `• 뉴스 - 시사, 경제, 정치\n` +
    `• 기타 - 위 카테고리 외`
  );
});

// ============================================
// 메시지 핸들러 (직렬 큐로 레이스 컨디션 방지)
// ============================================
// 핸들러 등록 전 확인
console.log(`📋 메시지 핸들러 등록 중... (현재 리스너 수: ${bot.listenerCount('message')}개)`);

bot.on('message', (msg) => {
  // 명령어와 빈 메시지는 큐에 넣지 않고 즉시 필터링
  const messageText = msg.text || msg.caption || '';
  if (messageText.startsWith('/') || !messageText.trim()) return;

  // ============================================
  // 최우선 중복 방지: 큐에 넣기 전에 체크 (레이스 컨디션 방지)
  // ============================================
  const messageId = msg.message_id;
  console.log(`🔍 [HANDLER] 메시지 수신: message_id=${messageId}, chat_id=${msg.chat.id}, text="${(msg.text || '').substring(0, 30)}...", 리스너 수: ${bot.listenerCount('message')}`);

  if (isMessageInStore(messageId)) {
    console.log(`⏭️ [HANDLER] 중복 감지 (message_id: ${messageId}), 즉시 건너뜀`);
    return;
  }

  // 임시로 저장소에 추가 (처리 시작 마킹)
  console.log(`✅ [HANDLER] 새 메시지 처리 시작: message_id=${messageId}`);
  botStatus.lastMessageReceived = new Date().toISOString();
  addMessageToStore(messageId);

  // 직렬 큐: 이전 메시지 처리가 완료된 후 다음 메시지 처리
  processingLock = processingLock
    .then(() => handleMessage(msg))
    .catch(err => console.error('❌ 메시지 처리 큐 오류:', err));
});

console.log(`✅ 메시지 핸들러 등록 완료 (현재 리스너 수: ${bot.listenerCount('message')}개)`);

// ============================================
// 메시지 처리 함수 (메인 로직)
// ============================================
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // 포워드된 메시지의 경우 텍스트 추출
  let messageText = msg.text || msg.caption || '';
  if (msg.forward_origin && msg.forward_origin.type === 'channel') {
    messageText = msg.text || msg.caption || '';
  }

  console.log(`\n📨 메시지 처리 시작 (message_id: ${messageId}): "${messageText.substring(0, 50)}..."`);

  try {
    // 처리 시작 알림
    const processingMsg = await bot.sendMessage(chatId, '⏳ 처리 중...');

    // Step 1: 메시지 파싱
    const { title, content } = parseMessage(messageText);
    console.log(`📥 제목: "${title}"`);

    // Step 2: Claude API로 분석
    console.log('🤖 AI 분석 중...');
    const analysis = await analyzeWithClaude(content || title);
    console.log(`✅ 분석 완료 - 카테고리: ${analysis.category}`);

    // Step 3: 노션에 저장 (내부에서 Notion 중복 조회도 수행)
    console.log('💾 노션 저장 중...');
    const notionPage = await saveToNotion({
      title,
      content,
      category: analysis.category,
      summary: analysis.summary,
      url: getMessageUrl(msg),
      telegramMessageId: messageId
    });

    botStatus.successfulSaves++;

    if (notionPage.alreadyExists) {
      console.log(`⏭️ Notion에 이미 존재 (message_id: ${messageId}), 건너뜀`);
      await bot.deleteMessage(chatId, processingMsg.message_id);
      await bot.sendMessage(chatId, `ℹ️ 이미 저장된 메시지입니다.`);
    } else {
      console.log(`✅ 노션 저장 완료 - Page ID: ${notionPage.id}`);
      await bot.deleteMessage(chatId, processingMsg.message_id);
      console.log(`📤 최종 응답 전송 중... (message_id: ${messageId})`);
      const finalMsg = await bot.sendMessage(chatId,
        `✅ 저장 완료! [${SERVER_TAG}]\n\n` +
        `📌 제목: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}\n` +
        `📂 카테고리: ${analysis.category}\n` +
        `📝 요약: ${analysis.summary.substring(0, 100)}${analysis.summary.length > 100 ? '...' : ''}\n\n` +
        `🔗 노션에서 확인하세요!`
      );
      console.log(`✅ 최종 응답 전송 완료 - Response message_id: ${finalMsg.message_id}`);
    }

    // 저장소에는 이미 추가됨 (메시지 핸들러에서 처리)

  } catch (error) {
    console.error('❌ Error:', error);
    botStatus.failedSaves++;
    await bot.sendMessage(chatId,
      `❌ 오류가 발생했습니다. [${SERVER_TAG}]\n\n` +
      `오류 내용: ${error.message}\n\n` +
      `다시 시도해 주세요.`
    );
  }
}


// ============================================
// 메시지 파싱 함수
// ============================================
function parseMessage(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());

  const title = lines[0] || '무제';
  const content = lines.slice(1).join('\n').trim();

  return { title, content };
}

// ============================================
// 텔레그램 메시지 URL 생성
// ============================================
function getMessageUrl(msg) {
  // 포워드된 메시지의 경우 원본 채널/그룹 정보 사용
  if (msg.forward_from_chat && msg.forward_from_message_id) {
    const chat = msg.forward_from_chat;
    if (chat.username) {
      return `https://t.me/${chat.username}/${msg.forward_from_message_id}`;
    }
  }
  return null;
}


// ============================================
// Claude API 분석 함수
// ============================================
async function analyzeWithClaude(text) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `아래 텍스트를 분석해서 카테고리와 요약을 생성하세요.

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
${text}`
        }
      ]
    });

    const responseText = message.content[0].text;

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('JSON 파싱 실패');

  } catch (error) {
    console.error('⚠️ Claude API 오류:', error.message);

    // 기본값 반환
    return {
      category: '기타',
      summary: '요약을 생성할 수 없습니다.'
    };
  }
}

// ============================================
// Notion 스키마 자동 설정
// ============================================
// telegram_message_id 속성이 없으면 자동으로 추가
let schemaChecked = false;
let hasMessageIdProperty = false;

async function ensureNotionSchema() {
  if (schemaChecked) return;

  try {
    const db = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
    if (db.properties['telegram_message_id']) {
      console.log('📋 telegram_message_id 속성 이미 존재');
      hasMessageIdProperty = true;
    } else {
      console.log('⚠️ Notion DB에 telegram_message_id 속성이 없습니다.');
      console.log('📋 속성 자동 추가를 시도하지 않습니다.');
      console.log('💡 Notion에서 수동으로 "telegram_message_id" (숫자 형식)를 추가하세요.');
      hasMessageIdProperty = false;
    }
    schemaChecked = true;
  } catch (error) {
    console.warn('⚠️ Notion 스키마 확인 실패:', error.message);
    console.warn('⚠️ Notion 중복 조회 기능을 비활성화합니다.');
    schemaChecked = true;
    hasMessageIdProperty = false;
    // 실패해도 봇 동작에는 영향 없음 - 저장은 진행
  }
}

// ============================================
// 노션 저장 함수
// ============================================
async function saveToNotion({ title, content, category, summary, url, telegramMessageId }) {
  // 스키마 자동 설정 (최초 1회)
  await ensureNotionSchema();

  // ============================================
  // Notion 중복 조회 (최종 안전망)
  // ============================================
  if (telegramMessageId && hasMessageIdProperty) {
    try {
      const existing = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
          property: 'telegram_message_id',
          number: { equals: telegramMessageId }
        },
        page_size: 1
      });

      if (existing.results.length > 0) {
        console.log(`⏭️ Notion 중복 감지 (telegram_message_id: ${telegramMessageId})`);
        return { ...existing.results[0], alreadyExists: true };
      }
    } catch (error) {
      console.warn('⚠️ Notion 중복 조회 실패 (저장은 계속 진행):', error.message);
      // 조회 실패해도 저장은 진행
    }
  }

  const properties = {
    '제목': {
      title: [{ text: { content: title.substring(0, 100) } }]
    },
    '본문': {
      rich_text: [{ text: { content: content.substring(0, 2000) || '(내용 없음)' } }]
    },
    '카테고리': {
      select: { name: category }
    },
    '간단요약': {
      rich_text: [{ text: { content: summary.substring(0, 500) } }]
    },
    '수집날짜': {
      date: { start: new Date().toISOString().split('T')[0] }
    }
  };

  // URL이 있는 경우에만 추가
  if (url) {
    properties['URL'] = { url: url };
  }

  // telegram_message_id 추가 (속성이 실제로 존재할 때만)
  if (telegramMessageId && hasMessageIdProperty) {
    properties['telegram_message_id'] = { number: telegramMessageId };
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: properties
    });
    return response;
  } catch (error) {
    // 존재하지 않는 속성으로 인한 오류 처리
    if (error.message && error.message.includes('is not a property that exists')) {
      console.warn('⚠️ Notion 저장 오류: 속성이 존재하지 않습니다.');
      console.log('📋 문제가 된 속성을 제거하고 재시도합니다...');

      // URL 속성 제거 후 재시도
      if (properties['URL']) {
        delete properties['URL'];
        console.log('🔄 URL 속성 제거 후 재시도 중...');
      }

      // 카테고리 속성 제거 후 재시도
      if (properties['카테고리'] && !properties['URL']) {
        delete properties['카테고리'];
        console.log('🔄 카테고리 속성 제거 후 재시도 중...');
      }

      // telegram_message_id 속성 제거 후 재시도
      if (properties['telegram_message_id']) {
        delete properties['telegram_message_id'];
        console.log('🔄 telegram_message_id 속성 제거 후 재시도 중...');
      }

      // 기본 속성(제목, 본문, 간단요약, 수집날짜)만으로 저장 시도
      const response = await notion.pages.create({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: properties
      });
      return response;
    }
    throw error;
  }
}

// ============================================
// 에러 핸들링
// ============================================
bot.on('polling_error', (error) => {
  botStatus.isPolling = false;
  botStatus.lastPollingError = {
    message: error.message,
    code: error.code,
    time: new Date().toISOString()
  };

  if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
    console.log('⏳ 텔레그램 서버 세션 정리 중... 잠시 후 자동 재시도합니다.');
  } else {
    console.error('⚠️ Polling error:', error.message);
  }

  // 잠시 후 상태 복구 (재시도 가정)
  setTimeout(() => { botStatus.isPolling = true; }, 5000);
});

// ============================================
// 시작 메시지
// ============================================
console.log('🤖 Telegram Notion Bot is starting...');
console.log('✅ Environment variables loaded');
console.log('✅ Bot initialized');
console.log('✅ Notion client initialized');
console.log('✅ Claude API initialized');
console.log('🎉 Bot is now running and listening for messages!');

// ============================================
// 전역 에러 핸들링 (프로세스 종료 방지)
// ============================================
process.on('uncaughtException', (err) => {
  console.error('❌ [CRITICAL] 예기치 않은 오류 발생 (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [CRITICAL] 처리되지 않은 Promise 거부 (Unhandled Rejection):', reason);
});

console.log('🛡️ 견고한 에러 핸들링이 적용되었습니다.');

// ============================================
// 테스트를 위한 export (프로덕션에서는 영향 없음)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseMessage,
    getMessageUrl,
    analyzeWithClaude,
    saveToNotion,
    ensureNotionSchema,
    handleMessage,
    app // 테스트용 export 추가
  };
}
