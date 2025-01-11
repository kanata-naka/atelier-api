import AbstractRepository from "./AbstractRepository";
import EpisodeRepository from "./EpisodeRepository";
import ComicModel from "../models/ComicModel";
import ComicGetListCondition from "../schemas/ComicGetListCondition";

export default class ComicRepository extends AbstractRepository<ComicModel> {
  constructor() {
    super(["comics"]);
  }

  public async get(condition: ComicGetListCondition): Promise<Array<ComicModel>> {
    let query = this.collectionRef.orderBy("createdAt", "desc");
    if (condition.restrict) {
      query = query.where("restrict", "in", condition.restrict);
    }
    if (condition.limit) {
      query = query.limit(condition.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as ComicModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }

  public getEpisodeRepository(id: string): EpisodeRepository {
    return new EpisodeRepository(id);
  }
}
