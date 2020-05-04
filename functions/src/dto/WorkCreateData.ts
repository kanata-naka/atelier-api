export default class WorkCreateData {
  /** タイトル */
  title!: string;
  /** 出版日 */
  publishedDate!: number;
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
