export default class TagInfoGetResponse {
  /** タグ情報 */
  info: Array<{
    /** タグ名 */
    name: string;
    /** 件数 */
    count: number;
  }> = [];
}
