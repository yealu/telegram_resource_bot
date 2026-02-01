/**
 * UptimeRobot & Replit 연동 확인 스크립트
 * 
 * 이 스크립트는 다음을 확인합니다:
 * 1. Replit URL이 응답하는지
 * 2. 응답 시간이 적절한지
 * 3. JSON 형식이 올바른지
 */

const https = require('https');

// Replit URL (여기에 실제 URL을 입력하세요)
const REPLIT_URL = 'https://telegram-notion-bot.YOUR_USERNAME.repl.co';

console.log('='.repeat(60));
console.log('🔍 UptimeRobot & Replit 연동 확인');
console.log('='.repeat(60));
console.log(`\n📡 테스트 URL: ${REPLIT_URL}\n`);

// URL에서 호스트와 경로 추출
const url = new URL(REPLIT_URL);

const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'GET',
    timeout: 10000
};

const startTime = Date.now();

const req = https.request(options, (res) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('✅ 연결 성공!\n');
        console.log(`⏱️  응답 시간: ${responseTime}ms`);
        console.log(`📊 상태 코드: ${res.statusCode}`);

        if (res.statusCode === 200) {
            console.log('✅ 상태 코드 정상 (200 OK)\n');

            try {
                const json = JSON.parse(data);
                console.log('📄 응답 내용:');
                console.log(JSON.stringify(json, null, 2));

                // JSON 검증
                console.log('\n🔍 JSON 검증:');
                const checks = {
                    'status 필드': json.status === 'alive',
                    'bot 필드': json.bot === 'Telegram Notion Bot',
                    'uptime 필드': typeof json.uptime === 'number',
                    'timestamp 필드': !!json.timestamp
                };

                let allPassed = true;
                for (const [check, passed] of Object.entries(checks)) {
                    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
                    if (!passed) allPassed = false;
                }

                console.log('\n' + '='.repeat(60));
                if (allPassed) {
                    console.log('🎉 모든 검증 통과! Replit 봇이 정상 작동 중입니다.');
                    console.log('\n📋 다음 단계:');
                    console.log('  1. UptimeRobot에 이 URL을 등록하세요');
                    console.log('  2. Monitoring Interval을 5분으로 설정하세요');
                    console.log('  3. 1시간 후 슬립 모드 방지를 테스트하세요');
                } else {
                    console.log('⚠️  일부 검증 실패. JSON 형식을 확인하세요.');
                }
                console.log('='.repeat(60));

            } catch (error) {
                console.log('❌ JSON 파싱 실패');
                console.log('📄 원본 응답:');
                console.log(data);
            }

        } else {
            console.log(`⚠️  비정상 상태 코드: ${res.statusCode}`);
            console.log('📄 응답 내용:');
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ 연결 실패!\n');
    console.log(`오류: ${error.message}\n`);
    console.log('='.repeat(60));
    console.log('🔧 문제 해결:');
    console.log('  1. Replit에서 봇이 실행 중인지 확인하세요');
    console.log('  2. Webview에서 올바른 URL을 복사하세요');
    console.log('  3. 이 스크립트의 REPLIT_URL을 수정하세요');
    console.log('='.repeat(60));
});

req.on('timeout', () => {
    console.log('❌ 타임아웃! (10초 초과)\n');
    console.log('='.repeat(60));
    console.log('🔧 문제 해결:');
    console.log('  1. Replit 봇이 슬립 모드일 수 있습니다');
    console.log('  2. Replit에서 봇을 재시작하세요');
    console.log('  3. 다시 시도하세요');
    console.log('='.repeat(60));
    req.destroy();
});

req.end();
