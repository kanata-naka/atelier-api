import AbstractRepository from "./AbstractRepository";
import WorkModel from "../models/WorkModel";
import WorkGetListData from "../schemas/WorkGetListData";

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
  public async get(data: WorkGetListData): Promise<Array<WorkModel>> {
    let query = this.collectionRef.orderBy(data.sort?.column || "createdAt", data.sort?.order || "desc");
    if (data.restrict) {
      // 条件：公開範囲
      query = query.where("restrict", "in", data.restrict);
    }
    if (data.limit) {
      // 条件：一度に取得する最大件数
      query = query.limit(data.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as WorkModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
