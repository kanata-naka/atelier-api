import { Restrict } from "../types";

export default interface WorkCreateRequest {
  /** タイトル */
  title: string;
  /** 出版日 */
  publishedDate: number;
  /** 画像の一覧 */
  images: Array<{
    /** ストレージ上のパス */
    name: string;
  }>;
  /** 説明 */
  description?: string;
  /** 公開範囲 */
  restrict: Restrict;
}
