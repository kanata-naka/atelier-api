import AbstractRepository from "./AbstractRepository";
import PageRepository from "./PageRepository";
import EpisodeModel from "../models/EpisodeModel";
import EpisodeGetListCondition from "../schemas/EpisodeGetListCondition";
import { Nullable } from "../types";

export default class EpisodeRepository extends AbstractRepository<EpisodeModel> {
  constructor(comicId: string) {
    super(["comics", comicId, "episodes"]);
  }

  public async get(condition: EpisodeGetListCondition): Promise<Array<EpisodeModel>> {
    let query = this.collectionRef.orderBy("no", "desc");
    if (condition.restrict) {
      query = query.where("restrict", "in", condition.restrict);
    }
    if (condition.limit) {
      query = query.limit(condition.limit);
    }

    return (await query.get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as EpisodeModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }

  public async getLatest(): Promise<Nullable<EpisodeModel>> {
    const snapshot = await this.collectionRef.orderBy("no", "desc").limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const result = snapshot.docs[0].data() as EpisodeModel;
    result.id = snapshot.docs[0].id;
    return result;
  }

  public getPageRepository(id: string): PageRepository {
    return new PageRepository(this.collectionRef.parent!.id, id);
  }
}
