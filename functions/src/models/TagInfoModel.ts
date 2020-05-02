import AbstractModel from "./AbstractModel";

/**
 * タグ情報のモデル
 */
export default class TagInfoModel extends AbstractModel {
  info: Array<{
    /** タグ名 */
    name: string;
    /** 件数 */
    count: number;
  }> = [];
}
