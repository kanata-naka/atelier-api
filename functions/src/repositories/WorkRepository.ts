import AbstractRepository from "./AbstractRepository";
import WorkModel from "../models/WorkModel";
import WorkGetListCondition from "../schemas/WorkGetListCondition";

export default class WorkRepository extends AbstractRepository<WorkModel> {
  constructor() {
    super(["works"]);
  }

  public async get(condition: WorkGetListCondition): Promise<Array<WorkModel>> {
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
      const result = documentSnapshot.data() as WorkModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
