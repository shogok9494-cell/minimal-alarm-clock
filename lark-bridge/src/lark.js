import crypto from 'node:crypto';

/**
 * Lark / Feishu カスタムボット Webhook への送信。
 *
 * 署名（セキュリティ設定で「署名検証」を有効にした場合）:
 *   string_to_sign = `${timestamp}\n${secret}`
 *   sign = base64( HMAC-SHA256(key = string_to_sign, message = "") )
 * ※ key と message が直感と逆なので注意。
 */
export function sign(timestamp, secret) {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto.createHmac('sha256', stringToSign).update('').digest('base64');
}

export function buildPayload(text, { secret, now = Date.now() } = {}) {
  const payload = { msg_type: 'text', content: { text } };
  if (secret) {
    const timestamp = Math.floor(now / 1000).toString();
    payload.timestamp = timestamp;
    payload.sign = sign(timestamp, secret);
  }
  return payload;
}

export async function sendText(text, { url, secret, fetchImpl = fetch } = {}) {
  if (!url) throw new Error('LARK_WEBHOOK_URL が未設定です');
  if (!text || !text.trim()) throw new Error('送信するテキストが空です');

  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(text, { secret })),
  });

  const raw = await res.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error(`Lark からの応答が JSON ではありません (HTTP ${res.status}): ${raw.slice(0, 200)}`);
  }

  // カスタムボットは成功時 StatusCode:0 / code:0 を返す
  const code = body.code ?? body.StatusCode;
  if (!res.ok || (code !== undefined && code !== 0)) {
    throw new Error(`Lark 送信失敗 (HTTP ${res.status}) code=${code} msg=${body.msg ?? body.StatusMessage ?? '不明'}`);
  }
  return body;
}
