/**
 * 同じ階層に .env があれば読み込む。無ければ何もしない。
 * 環境変数が既に設定されている場合はそちらを優先する（クラウド環境の設定が勝つ）。
 */
export function loadEnvFile() {
  try {
    process.loadEnvFile(new URL('../.env', import.meta.url));
  } catch {
    // .env が無いのは正常。クラウド環境では環境変数が直接渡される。
  }
}
