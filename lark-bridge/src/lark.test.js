import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, sendText, sign } from './lark.js';

test('署名なしのペイロードは msg_type と content だけ', () => {
  assert.deepEqual(buildPayload('やあ'), {
    msg_type: 'text',
    content: { text: 'やあ' },
  });
});

test('署名ありのペイロードは timestamp と sign を含む', () => {
  const p = buildPayload('やあ', { secret: 'testsecret', now: 1_700_000_000_000 });
  assert.equal(p.timestamp, '1700000000');
  assert.equal(p.sign, sign('1700000000', 'testsecret'));
  assert.equal(p.content.text, 'やあ');
});

test('code:0 は成功として扱う', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: true, status: 200, text: async () => JSON.stringify({ code: 0, msg: 'success' }) };
  };
  await sendText('テスト', { url: 'https://example.invalid/hook/abc', fetchImpl: fakeFetch });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.content.text, 'テスト');
});

test('code が 0 以外なら例外を投げる', async () => {
  const fakeFetch = async () => ({
    ok: true, status: 200,
    text: async () => JSON.stringify({ code: 19021, msg: 'sign match fail' }),
  });
  await assert.rejects(
    () => sendText('テスト', { url: 'https://example.invalid/hook/abc', fetchImpl: fakeFetch }),
    /code=19021/,
  );
});

test('URL 未設定なら送信前に落ちる', async () => {
  await assert.rejects(() => sendText('テスト', {}), /LARK_WEBHOOK_URL/);
});

test('空文字は送信しない', async () => {
  await assert.rejects(
    () => sendText('   ', { url: 'https://example.invalid/hook/abc' }),
    /空です/,
  );
});
