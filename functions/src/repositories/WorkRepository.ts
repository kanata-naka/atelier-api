import AbstractRepository from "./AbstractRepository";
import WorkModel from "../models/WorkModel";
import WorkGetCondition from "../dto/WorkGetCondition";

/**
 * 作品のリポジトリ
 */
export default class WorkRepository extends AbstractRepository<WorkModel> {
  constructor() {
    super("works");
  }

  /**
   * 作品の一覧を取得する
   * @param condition
   */
  public async get(condition: WorkGetCondition): Promise<Array<WorkModel>> {
    // 作成日時の降順で取得する
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (condition.pickupFlag) {
      // 条件：ピックアップ対象かどうか
      query = query.where("pickupFlag", "==", true);
    }
    if (condition.limit) {
      // 条件：一度に取得する最大件数
      query = query.limit(condition.limit);
    }
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as WorkModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
