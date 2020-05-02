export default class TagInfoGetByIdResponse {
  /** タグ情報 */
  info: Array<{
    /** タグ名 */
    name: string;
    /** 件数 */
    count: number;
  }> = [];
  /** 作成日時 */
  createdAt?: number;
  /** 更新日時 */
  updatedAt?: number;
}
