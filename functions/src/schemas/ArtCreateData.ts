export default interface ArtCreateData {
  /** タイトル */
  title: string;
  /** タグの一覧 */
  tags?: Array<string>;
  /** 画像の一覧 */
  images: Array<{
    /** ストレージ上のパス */
    name: string;
  }>;
  /** 説明 */
  description?: string;
  /** 公開範囲 */
  restrict: string;
  /** 作成日時 */
  createdAt?: number;
}
