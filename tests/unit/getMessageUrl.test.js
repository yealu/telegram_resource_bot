const { getMessageUrl } = require('../../bot');

describe('getMessageUrl', () => {
  test('정상 포워드 메시지 → URL 생성', () => {
    const msg = {
      forward_from_chat: { username: 'testchannel' },
      forward_from_message_id: 12345
    };
    const url = getMessageUrl(msg);
    expect(url).toBe('https://t.me/testchannel/12345');
  });

  test('username 없음 → null 반환', () => {
    const msg = {
      forward_from_chat: {},
      forward_from_message_id: 12345
    };
    expect(getMessageUrl(msg)).toBeNull();
  });

  test('forward_from_chat 없음 → null 반환', () => {
    const msg = {
      forward_from_message_id: 12345
    };
    expect(getMessageUrl(msg)).toBeNull();
  });

  test('포워드 아닌 일반 메시지 → null 반환', () => {
    const msg = { text: '일반 메시지', chat_id: 123 };
    expect(getMessageUrl(msg)).toBeNull();
  });

  test('real 채널 예시 (YouTube 관련)', () => {
    const msg = {
      forward_from_chat: { username: 'youtube' },
      forward_from_message_id: 999
    };
    expect(getMessageUrl(msg)).toBe('https://t.me/youtube/999');
  });

  test('private 채널 (username 없는 경우) → null', () => {
    const msg = {
      forward_from_chat: { id: -100123456789, title: 'Private Channel' },
      forward_from_message_id: 555
    };
    expect(getMessageUrl(msg)).toBeNull();
  });
});
