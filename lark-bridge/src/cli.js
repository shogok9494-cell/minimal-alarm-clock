#!/usr/bin/env node
import { sendText } from './lark.js';
import { loadEnvFile } from './env.js';

loadEnvFile();

const text = process.argv.slice(2).join(' ');
if (!text) {
  console.error('使い方: node src/cli.js "送りたいメッセージ"');
  process.exit(2);
}

try {
  await sendText(text, {
    url: process.env.LARK_WEBHOOK_URL,
    secret: process.env.LARK_WEBHOOK_SECRET,
  });
  console.log('送信成功');
} catch (err) {
  // URL やシークレットを絶対にログへ出さない
  console.error('送信失敗:', err.message);
  process.exit(1);
}
