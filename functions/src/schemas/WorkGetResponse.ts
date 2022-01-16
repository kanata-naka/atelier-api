export default interface WorkGetResponse {
  /** ID */
  id: string;
  /** タイトル */
  title: string;
  /** 出版日 */
  publishedDate: number;
  /** 画像の一覧 */
  images?: Array<{
    /** ストレージ上のパス */
    name: string;
    /** 画像のURL */
    url: string;
    /** サムネイル画像のURL */
    thumbnailUrl: {
      /** サムネイル画像（小）のURL */
      small: string;
    };
  }>;
  /** 説明 */
  description?: string;
  /** 公開範囲 */
  restrict: string;
  /** 作成日時 */
  createdAt: number;
  /** 更新日時 */
  updatedAt: number;
}
