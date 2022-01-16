export default interface ArtGetListData {
  /** タグ */
  tag?: string;
  /** 公開範囲 */
  restrict?: string[];
  /** 最後のID（自動スクロールで使用） */
  lastId?: string;
  /** 一度に取得する最大件数 */
  limit?: number;
}
