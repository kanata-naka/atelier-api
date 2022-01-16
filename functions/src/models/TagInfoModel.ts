import BaseModel from "./BaseModel";

/**
 * タグ情報のモデル
 */
export default interface TagInfoModel extends BaseModel {
  info: Array<{
    /** タグ名 */
    name: string;
    /** 件数 */
    count: number;
  }>;
}
