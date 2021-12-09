import AbstractRepository from "./AbstractRepository";
import TopImageModel from "../models/TopImageModel";

/**
 * トップ画像のリポジトリ
 */
export default class TopImageRepository extends AbstractRepository<TopImageModel> {
  constructor() {
    super("topImages");
  }

  /**
   * トップ画像の一覧を取得する
   */
  public async get(): Promise<Array<TopImageModel>> {
    // 表示順の昇順で取得する
    const query = this.collectionRef.orderBy("order", "asc");

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as TopImageModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
