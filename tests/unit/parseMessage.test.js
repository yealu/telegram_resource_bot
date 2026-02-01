const { parseMessage } = require('../../bot');

describe('parseMessage', () => {
  test('단일 라인 텍스트 → 제목만, 본문 빈 문자열', () => {
    const result = parseMessage('제목만 있는 메시지');
    expect(result.title).toBe('제목만 있는 메시지');
    expect(result.content).toBe('');
  });

  test('여러 라인 텍스트 → 첫 줄 제목, 나머지 본문', () => {
    const text = '제목\n본문 1줄\n본문 2줄';
    const result = parseMessage(text);
    expect(result.title).toBe('제목');
    expect(result.content).toBe('본문 1줄\n본문 2줄');
  });

  test('빈 문자열 → 제목 "무제", 본문 빈 문자열', () => {
    const result = parseMessage('');
    expect(result.title).toBe('무제');
    expect(result.content).toBe('');
  });

  test('공백만 있는 텍스트 → 제목 "무제"', () => {
    const result = parseMessage('   \n  \n  ');
    expect(result.title).toBe('무제');
    expect(result.content).toBe('');
  });

  test('특수문자 포함 텍스트', () => {
    const text = '🙃 "맨틀 리브랜딩 스티커 챌린지" 개최\n자세한 내용...';
    const result = parseMessage(text);
    expect(result.title).toBe('🙃 "맨틀 리브랜딩 스티커 챌린지" 개최');
    expect(result.content).toBe('자세한 내용...');
  });
});
