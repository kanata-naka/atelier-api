/**
 * 作品の一覧を取得する条件
 */
export default class WorkGetCondition {
  /** ピックアップフラグ */
  pickupFlag?: boolean;
  /** 一度に取得する最大件数 */
  limit?: number;
  /** ソート */
  sort?: {
    /** ソート対象のカラム */
    column: "publishedDate" | "createdAt";
    /** ソートの方向 */
    order: "asc" | "desc";
  };
}
