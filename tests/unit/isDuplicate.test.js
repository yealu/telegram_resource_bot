const fs = require('fs');
const path = require('path');

// dedup-store 모듈 로드
const dedupStore = require('../../dedup-store');
const { loadProcessedMessages, isMessageInStore, addMessageToStore, clearStore, getStoreSize, DEDUP_FILE, DEDUP_TMP } = dedupStore;

// 테스트 전후로 파일과 메모리 상태 정리
function cleanup() {
  clearStore();
  try { fs.unlinkSync(DEDUP_FILE); } catch (e) {}
  try { fs.unlinkSync(DEDUP_TMP); } catch (e) {}
}

beforeEach(() => {
  cleanup();
});

afterAll(() => {
  cleanup();
});

describe('dedup-store: 기본 동작', () => {
  test('새로운 message_id는 저장소에 없음', () => {
    expect(isMessageInStore(12345)).toBe(false);
  });

  test('추가한 message_id는 저장소에 있음', () => {
    addMessageToStore(12345);
    expect(isMessageInStore(12345)).toBe(true);
  });

  test('다른 message_id는 중복이 아님', () => {
    addMessageToStore(111);
    expect(isMessageInStore(222)).toBe(false);
  });

  test('여러 message_id 추가 및 확인', () => {
    addMessageToStore(1);
    addMessageToStore(2);
    addMessageToStore(3);
    expect(getStoreSize()).toBe(3);
    expect(isMessageInStore(1)).toBe(true);
    expect(isMessageInStore(2)).toBe(true);
    expect(isMessageInStore(3)).toBe(true);
    expect(isMessageInStore(4)).toBe(false);
  });
});

describe('dedup-store: 파일 영속성', () => {
  test('addMessageToStore 후 JSON 파일이 생성됨', () => {
    addMessageToStore(99999);
    expect(fs.existsSync(DEDUP_FILE)).toBe(true);
  });

  test('저장된 파일의 형식이 올바름', () => {
    addMessageToStore(11111);
    const raw = fs.readFileSync(DEDUP_FILE, 'utf-8');
    const data = JSON.parse(raw);
    expect(data.version).toBe(1);
    expect(data.messages).toBeDefined();
    expect(data.messages['11111']).toBeDefined();
    expect(typeof data.messages['11111']).toBe('number');
  });

  test('파일에서 로드하면 이전 상태가 복원됨', () => {
    addMessageToStore(55555);
    addMessageToStore(66666);

    // 인메모리 상태 초기화 (프로세스 재시작 시뮬레이션)
    clearStore();
    expect(isMessageInStore(55555)).toBe(false);

    // 파일에서 로드
    loadProcessedMessages();
    expect(isMessageInStore(55555)).toBe(true);
    expect(isMessageInStore(66666)).toBe(true);
  });
});

describe('dedup-store: 엣지 케이스', () => {
  test('파일이 없을 때 loadProcessedMessages는 에러 없이 동작', () => {
    expect(() => loadProcessedMessages()).not.toThrow();
  });

  test('파일이 손상되었을 때 빈 상태로 시작', () => {
    fs.writeFileSync(DEDUP_FILE, '{ invalid json !!!', 'utf-8');
    expect(() => loadProcessedMessages()).not.toThrow();
    expect(getStoreSize()).toBe(0);
  });

  test('clearStore 후 저장소가 비어있음', () => {
    addMessageToStore(1);
    addMessageToStore(2);
    clearStore();
    expect(getStoreSize()).toBe(0);
    expect(isMessageInStore(1)).toBe(false);
  });

  test('숫자와 문자열 message_id 모두 처리', () => {
    addMessageToStore(12345);
    // 내부적으로 문자열로 변환되므로 양쪽 다 작동해야 함
    expect(isMessageInStore(12345)).toBe(true);
    expect(isMessageInStore('12345')).toBe(true);
  });
});
