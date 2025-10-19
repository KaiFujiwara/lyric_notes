/**
 * タイムスタンプユーティリティ
 * データベースから取得したタイムスタンプの正規化処理
 */

// タイムスタンプ判定閾値: UNIX秒（10桁）とミリ秒（13桁）の境界
const SEC_MS_THRESHOLD = 1e10;

/**
 * タイムスタンプを正規化（秒/ミリ秒両対応 → ミリ秒統一）
 *
 * DBに格納されたタイムスタンプが秒単位かミリ秒単位かを自動判定し、
 * JavaScriptのDate互換なミリ秒に統一する。
 *
 * @param ts - UNIX秒またはミリ秒のタイムスタンプ
 * @returns ミリ秒単位のタイムスタンプ
 *
 * @example
 * normalizeTimestamp(1704067200)     // → 1704067200000 (秒→ミリ秒変換)
 * normalizeTimestamp(1704067200000)  // → 1704067200000 (既にミリ秒)
 */
export function normalizeTimestamp(ts: number): number {
  return ts < SEC_MS_THRESHOLD ? ts * 1000 : ts;
}
