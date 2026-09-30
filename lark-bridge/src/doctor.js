#!/usr/bin/env node
/**
 * ブリッジの健全性を上から順に診断する。
 * 秘密情報は一切表示せず、「設定あり／未設定」と伏せ字だけを出す。
 */
import { sendText } from './lark.js';

const url = process.env.LARK_WEBHOOK_URL;
const secret = process.env.LARK_WEBHOOK_SECRET;
const results = [];
const ok = (n, m) => results.push(['○', n, m]);
const ng = (n, m) => results.push(['×', n, m]);
const warn = (n, m) => results.push(['△', n, m]);

// 1. URL の有無
if (!url) {
  ng('Webhook URL', 'LARK_WEBHOOK_URL が未設定');
} else {
  ok('Webhook URL', `設定あり（末尾4文字: …${url.slice(-4)}）`);
}

// 2. URL の形
if (url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    ng('URL の形式', 'URL として解釈できない');
  }
  if (parsed) {
    if (parsed.protocol !== 'https:') ng('URL の形式', 'https ではない');
    else if (!/\/open-apis\/bot\/v2\/hook\//.test(parsed.pathname)) {
      warn('URL の形式', `想定のパス形と違う（${parsed.pathname}）。カスタムボットのURLか確認`);
    } else {
      ok('URL の形式', `${parsed.host} のカスタムボット`);
    }
  }
}

// 3. シークレット
if (secret) ok('署名シークレット', `設定あり（${secret.length} 文字）`);
else warn('署名シークレット', '未設定。ボット側で署名検証をONにしているなら必須');

// 4. 時刻ずれ（署名検証は時刻に依存する）
const jst = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
ok('コンテナ時刻', `${jst} JST`);

// 5. 実送信
if (url) {
  const text = `ブリッジ確認OK（${jst}）`;
  try {
    await sendText(text, { url, secret });
    ok('送信テスト', `成功: 「${text}」を送信`);
  } catch (err) {
    ng('送信テスト', err.message);
  }
} else {
  results.push(['−', '送信テスト', 'スキップ（URL 未設定のため）']);
}

// 全角文字は表示幅2として数える
const width = s => [...s].reduce((n, c) => n + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(c) ? 2 : 1), 0);
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - width(s)));
const w = Math.max(...results.map(r => width(r[1])), width('項目'));
console.log('\n結果  ' + pad('項目', w) + '  メモ');
console.log('─'.repeat(w + 40));
for (const [mark, name, memo] of results) {
  console.log(` ${mark}    ${pad(name, w)}  ${memo}`);
}
console.log();

const failed = results.filter(r => r[0] === '×').length;
if (failed) {
  console.log(`${failed} 件が失敗。README の「よくあるエラー」を参照。`);
  process.exit(1);
}
console.log('ブリッジは正常です。');
