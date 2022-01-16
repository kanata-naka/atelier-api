export default interface WorkGetData {
  /** 公開範囲 */
  restrict?: string[];
  /** 一度に取得する最大件数 */
  limit?: number;
  /** ソート */
  sort?: {
    /** ソート対象のカラム */
    column?: "publishedDate" | "createdAt";
    /** ソートの方向 */
    order?: "asc" | "desc";
  };
}
