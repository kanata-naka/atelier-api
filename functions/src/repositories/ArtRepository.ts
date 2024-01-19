import ArtModel from "../models/ArtModel";
import ArtGetListCondition from "../schemas/ArtGetListCondition";
import AbstractRepository from "./AbstractRepository";

export default class ArtRepository extends AbstractRepository<ArtModel> {
  constructor() {
    super("arts");
  }

  public async get(condition: ArtGetListCondition): Promise<Array<ArtModel>> {
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (condition.tag) {
      query = query.where("tags", "array-contains", condition.tag);
    }
    if (condition.restrict) {
      query = query.where("restrict", "in", condition.restrict);
    }
    if (condition.lastId) {
      query = query.startAfter(await this.collectionRef.doc(condition.lastId).get());
    }
    if (condition.limit) {
      query = query.limit(condition.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as ArtModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
