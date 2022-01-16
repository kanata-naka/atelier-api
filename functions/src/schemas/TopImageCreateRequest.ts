export default interface TopImageCreateRequest {
  /** 画像 */
  image: {
    /** ストレージ上のパス */
    name: string;
  };
  /** サムネイル画像 */
  thumbnailImage: {
    /** ストレージ上のパス */
    name: string;
  };
  /** 説明 */
  description?: string;
  /** 表示順 */
  order: number;
}
