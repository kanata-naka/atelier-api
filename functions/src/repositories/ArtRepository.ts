import AbstractRepository from "./AbstractRepository";
import ArtModel from "../models/ArtModel";
import ArtGetCondition from "../dto/ArtGetCondition";

/**
 * アート（イラスト）のリポジトリ
 */
export default class ArtRepository extends AbstractRepository<ArtModel> {
  constructor() {
    super("arts");
  }

  /**
   * アート（イラスト）の一覧を取得する
   * @param condition
   */
  public async get(condition: ArtGetCondition): Promise<Array<ArtModel>> {
    // 作成日時の降順で取得する
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (condition.tag) {
      // 条件：タグ
      query = query.where("tags", "array-contains", condition.tag);
    }
    if (condition.pickupFlag) {
      // 条件：ピックアップフラグ
      query = query.where("pickupFlag", "==", true);
    }
    if (condition.lastId) {
      // 条件：最後のID（自動スクロール用）
      query = query.startAfter(
        await this.collectionRef.doc(condition.lastId).get()
      );
    }
    if (condition.limit) {
      // 条件：一度に取得する最大件数
      query = query.limit(condition.limit);
    }
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as ArtModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
