import { Restrict } from "../types";

export default interface ArtCreateRequest {
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
  restrict: Restrict;
  /** 作成日時 */
  createdAt?: number;
}
