export default class ArtGetByIdResponse {
  /** ID */
  id!: string;
  /** タイトル */
  title!: string;
  /** タグの一覧 */
  tags?: Array<string>;
  /** 画像の一覧 */
  images!: Array<{
    /** ストレージ上のパス */
    name: string;
    /** 画像のURL */
    url: string;
  }>;
  /** 説明 */
  description?: string;
  /** ピックアップフラグ */
  pickupFlag?: boolean;
  /** 作成日時 */
  createdAt?: number;
  /** 更新日時 */
  updatedAt?: number;
}
