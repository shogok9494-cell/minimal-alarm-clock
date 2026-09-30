# このリポジトリについて

目覚まし時計のWebアプリ（`index.html` / `script.js` / `style.css`）と、
Lark 送信ブリッジ（`lark-bridge/`）が同居している。

## Lark への送信について（重要）

**Claude には Lark／Feishu の公式コネクタが無い。** コネクタ設定を探しても見つからないので探さないこと。
代わりに `lark-bridge/` が送信手段として用意されている。

### 使い方

ユーザーから「Larkに送って」「通知して」等と言われたら、これを使う:

```bash
cd lark-bridge && npm run send -- "本文"
```

状態を確認したいときは:

```bash
cd lark-bridge && npm run doctor
```

依存パッケージは無いので `npm install` は不要。Node 18 以上で動く。

### 必要な環境変数

- `LARK_WEBHOOK_URL` … Lark グループのカスタムボット Webhook URL
- `LARK_WEBHOOK_SECRET` … 署名検証を有効にしている場合のみ

**未設定なら、まずそれを伝える。** 環境変数が無い状態で送信を試みても必ず失敗する。
設定はクラウド環境メニューの「Edit」から行う。ユーザーにチャットへ値を貼らせないこと。

### 扱ってはいけないこと

- URL とシークレットは**パスワードと同等**。表示・ログ出力・コミットをしない
- `.env` は `.gitignore` 済み。絶対にコミットしない

### できないこと

Lark から Claude への**受信は未対応**。カスタムアプリ（`app_id`/`app_secret`、要管理者権限）と
常時稼働する受け口のホスティングが別途必要。ユーザーに聞かれたらそう答える。
