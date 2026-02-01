const fs = require('fs');
const path = require('path');

// ============================================
// 파일 기반 영속적 중복방지 저장소
// ============================================
// 프로세스 재시작에도 살아남는 message_id 추적
// Replit 환경에서 인메모리 Set/Map의 한계를 해결

const DEDUP_FILE = path.join(__dirname, 'processed_messages.json');
const DEDUP_TMP = DEDUP_FILE + '.tmp';
const DEDUP_TTL = 24 * 60 * 60 * 1000; // 24시간
const MAX_ENTRIES = 5000;

// 인메모리 캐시 (파일에서 로드)
const processedMap = new Map(); // message_id(string) -> timestamp(number)

/**
 * 시작 시 파일에서 처리된 메시지 목록을 로드
 */
function loadProcessedMessages() {
  try {
    if (fs.existsSync(DEDUP_FILE)) {
      const raw = fs.readFileSync(DEDUP_FILE, 'utf-8');
      const data = JSON.parse(raw);

      if (data && data.messages && typeof data.messages === 'object') {
        const now = Date.now();
        let loaded = 0;

        for (const [id, timestamp] of Object.entries(data.messages)) {
          // TTL 이내의 항목만 로드
          if (now - timestamp < DEDUP_TTL) {
            processedMap.set(id, timestamp);
            loaded++;
          }
        }

        console.log(`📂 중복방지 저장소 로드 완료: ${loaded}개 항목 (파일: ${Object.keys(data.messages).length}개)`);
      }
    } else {
      console.log('📂 중복방지 저장소 파일 없음, 새로 시작합니다.');
    }
  } catch (error) {
    console.warn('⚠️ 중복방지 저장소 로드 실패 (손상된 파일?), 빈 상태로 시작:', error.message);
    processedMap.clear();
  }
}

/**
 * 메시지가 이미 처리되었는지 확인
 */
function isMessageInStore(messageId) {
  const key = String(messageId);
  if (!processedMap.has(key)) return false;

  const timestamp = processedMap.get(key);
  const now = Date.now();

  // TTL 만료된 항목은 제거
  if (now - timestamp > DEDUP_TTL) {
    processedMap.delete(key);
    return false;
  }

  return true;
}

/**
 * 메시지를 처리 완료로 마킹하고 파일에 저장
 */
function addMessageToStore(messageId) {
  const key = String(messageId);
  processedMap.set(key, Date.now());

  // 최대 항목 수 초과 시 오래된 것부터 제거
  pruneStore();

  // 파일에 영속화
  persistToFile();
}

/**
 * 오래된 항목 및 초과 항목 정리
 */
function pruneStore() {
  const now = Date.now();

  // TTL 만료 항목 제거
  for (const [id, timestamp] of processedMap.entries()) {
    if (now - timestamp > DEDUP_TTL) {
      processedMap.delete(id);
    }
  }

  // MAX_ENTRIES 초과 시 오래된 순서대로 제거
  if (processedMap.size > MAX_ENTRIES) {
    const sorted = [...processedMap.entries()].sort((a, b) => a[1] - b[1]);
    const toRemove = sorted.slice(0, processedMap.size - MAX_ENTRIES);
    for (const [id] of toRemove) {
      processedMap.delete(id);
    }
  }
}

/**
 * 원자적 파일 쓰기 (tmp 파일 → rename)
 */
function persistToFile() {
  try {
    const data = {
      version: 1,
      updatedAt: new Date().toISOString(),
      messages: Object.fromEntries(processedMap)
    };

    const json = JSON.stringify(data, null, 2);

    // 임시 파일에 먼저 쓰고 rename (원자적 쓰기)
    fs.writeFileSync(DEDUP_TMP, json, 'utf-8');
    fs.renameSync(DEDUP_TMP, DEDUP_FILE);
  } catch (error) {
    console.warn('⚠️ 중복방지 저장소 파일 쓰기 실패:', error.message);
    // 파일 쓰기 실패해도 인메모리 캐시는 유지
  }
}

/**
 * 저장소 크기 반환 (테스트용)
 */
function getStoreSize() {
  return processedMap.size;
}

/**
 * 저장소 초기화 (테스트용)
 */
function clearStore() {
  processedMap.clear();
}

module.exports = {
  loadProcessedMessages,
  isMessageInStore,
  addMessageToStore,
  pruneStore,
  getStoreSize,
  clearStore,
  // 테스트에서 상수 접근용
  DEDUP_FILE,
  DEDUP_TMP,
  DEDUP_TTL,
  MAX_ENTRIES
};
