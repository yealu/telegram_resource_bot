/**
 * Notion API 연결 테스트
 * 실행: node test-notion.js
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function testNotionAPI() {
  console.log('🔍 Notion API 연결 테스트 시작...\n');

  // 토큰 확인
  if (!NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN이 .env에 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID가 .env에 설정되지 않았습니다.');
    process.exit(1);
  }

  console.log(`📌 토큰: ${NOTION_TOKEN.substring(0, 15)}...`);
  console.log(`📌 데이터베이스 ID: ${NOTION_DATABASE_ID}`);

  const notion = new Client({ auth: NOTION_TOKEN });

  // 1. 데이터베이스 접근 테스트
  console.log('\n--- 1. 데이터베이스 접근 테스트 ---');
  try {
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });

    console.log('✅ 데이터베이스 접근 성공!');
    console.log(`   - 제목: ${database.title[0]?.plain_text || '(제목 없음)'}`);
    console.log(`   - 속성 목록:`);

    for (const [name, prop] of Object.entries(database.properties)) {
      console.log(`     • ${name}: ${prop.type}`);
    }

  } catch (error) {
    console.error('❌ 데이터베이스 접근 실패!');
    console.error(`   오류: ${error.message}`);
    if (error.code === 'object_not_found') {
      console.error('\n⚠️ 해결 방법:');
      console.error('   1. Notion에서 해당 데이터베이스 페이지 열기');
      console.error('   2. 우측 상단 ... 클릭 → "연결" 선택');
      console.error('   3. 생성한 Integration 연결하기');
    }
    return;
  }

  // 2. 테스트 페이지 생성
  console.log('\n--- 2. 테스트 페이지 생성 ---');
  try {
    const testPage = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        '제목': {
          title: [{ text: { content: '[테스트] API 연결 테스트' } }]
        },
        '본문': {
          rich_text: [{ text: { content: '이 항목은 API 테스트로 생성되었습니다. 삭제해도 됩니다.' } }]
        },
        '카테고리': {
          select: { name: '기타' }
        },
        '간단요약': {
          rich_text: [{ text: { content: 'Notion API 연결 테스트 성공' } }]
        },
        '수집날짜': {
          date: { start: new Date().toISOString().split('T')[0] }
        }
      }
    });

    console.log('✅ 테스트 페이지 생성 성공!');
    console.log(`   - Page ID: ${testPage.id}`);
    console.log(`   - URL: ${testPage.url}`);
    console.log('\n📝 Notion 데이터베이스에서 "[테스트] API 연결 테스트" 항목을 확인하세요.');

  } catch (error) {
    console.error('❌ 페이지 생성 실패!');
    console.error(`   오류: ${error.message}`);

    if (error.message.includes('Could not find property')) {
      console.error('\n⚠️ 데이터베이스 스키마 불일치:');
      console.error('   필요한 속성: 제목, 본문, 카테고리, 간단요약, 수집날짜');
    }
  }
}

testNotionAPI();
