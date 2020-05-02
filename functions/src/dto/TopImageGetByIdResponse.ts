export default class TopImageGetByIdResponse {
  /** ID */
  id!: string;
  /** 画像 */
  image!: {
    /** ストレージ上のパス */
    name: string;
    /** 画像のURL */
    url: string;
  };
  /** サムネイル画像 */
  thumbnailImage!: {
    /** ストレージ上のパス */
    name: string;
    /** 画像のURL */
    url: string;
  };
  /** 説明 */
  description?: string;
  /** 表示順 */
  order!: number;
  /** 作成日時 */
  createdAt?: number;
  /** 更新日時 */
  updatedAt?: number;
}
