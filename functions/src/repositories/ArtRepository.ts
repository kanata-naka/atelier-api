import ArtModel from "../models/ArtModel";
import ArtGetListCondition from "../schemas/ArtGetListCondition";
import AbstractRepository from "./AbstractRepository";

/**
 * イラストのリポジトリ
 */
export default class ArtRepository extends AbstractRepository<ArtModel> {
  constructor() {
    super("arts");
  }

  /**
   * イラストの一覧を取得する
   * @param data
   */
  public async get(condition: ArtGetListCondition): Promise<Array<ArtModel>> {
    // 作成日時の降順で取得する
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (condition.tag) {
      // 条件：タグ
      query = query.where("tags", "array-contains", condition.tag);
    }
    if (condition.restrict) {
      // 条件：公開範囲
      query = query.where("restrict", "in", condition.restrict);
    }
    if (condition.lastId) {
      // 条件：最後のID（自動スクロール用）
      query = query.startAfter(await this.collectionRef.doc(condition.lastId).get());
    }
    if (condition.limit) {
      // 条件：一度に取得する最大件数
      query = query.limit(condition.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as ArtModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
