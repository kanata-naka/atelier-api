import AbstractModel from "./AbstractModel";

/**
 * 作品のモデル
 */
export default class WorkModel extends AbstractModel {
  /** タイトル */
  title!: string;
  /** 出版日 */
  publishedDate?: FirebaseFirestore.Timestamp;
  /** 画像の一覧 */
  images!: Array<{
    /** ストレージ上のパス */
    name: string;
  }>;
  /** 説明 */
  description?: string;
  /** 公開範囲 */
  restrict?: string = "0";
}
