/**
 * 作品の一覧を取得する条件
 */
export default class WorkGetCondition {
  /** ピックアップ対象かどうか */
  pickupFlag?: boolean;
  /** 一度に取得する最大件数 */
  limit?: number;
}
