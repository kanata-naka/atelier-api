import BaseModel from "./BaseModel";

/**
 * トップ画像のモデル
 */
export default interface TopImageModel extends BaseModel {
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
