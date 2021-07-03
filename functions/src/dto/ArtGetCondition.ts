/**
 * アート（イラスト）の一覧を取得する条件
 */
export default class ArtGetCondition {
  /** タグ */
  tag?: string;
  /** 公開範囲 */
  restrict?: string[];
  /** 最後のID（自動スクロールで使用） */
  lastId?: string;
  /** 一度に取得する最大件数 */
  limit?: number;
}
