import AbstractRepository from "./AbstractRepository";
import ArtModel from "../models/ArtModel";
import ArtGetListData from "../schemas/ArtGetListData";

/**
 * アートのリポジトリ
 */
export default class ArtRepository extends AbstractRepository<ArtModel> {
  constructor() {
    super("arts");
  }

  /**
   * アートの一覧を取得する
   * @param data
   */
  public async get(data: ArtGetListData): Promise<Array<ArtModel>> {
    // 作成日時の降順で取得する
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (data.tag) {
      // 条件：タグ
      query = query.where("tags", "array-contains", data.tag);
    }
    if (data.restrict) {
      // 条件：公開範囲
      query = query.where("restrict", "in", data.restrict);
    }
    if (data.lastId) {
      // 条件：最後のID（自動スクロール用）
      query = query.startAfter(await this.collectionRef.doc(data.lastId).get());
    }
    if (data.limit) {
      // 条件：一度に取得する最大件数
      query = query.limit(data.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as ArtModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
