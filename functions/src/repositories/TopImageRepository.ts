import TopImageModel from "../models/TopImageModel";
import AbstractRepository from "./AbstractRepository";

export default class TopImageRepository extends AbstractRepository<TopImageModel> {
  constructor() {
    super("topImages");
  }

  public async get(): Promise<Array<TopImageModel>> {
    const query = this.collectionRef.orderBy("order", "asc");

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as TopImageModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
