import AbstractModel from "./AbstractModel";

/**
 * アート（イラスト）のモデル
 */
export default class ArtModel extends AbstractModel {
  /** タイトル */
  title!: string;
  /** タグの一覧 */
  tags?: Array<string>;
  /** 画像の一覧 */
  images!: Array<{
    /** ストレージ上のパス */
    name: string;
  }>;
  /** 説明 */
  description?: string;
  /** ピックアップフラグ */
  pickupFlag?: boolean = false;
}