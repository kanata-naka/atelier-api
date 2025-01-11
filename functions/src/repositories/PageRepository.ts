import AbstractRepository from "./AbstractRepository";
import PageModel from "../models/PageModel";

export default class PageRepository extends AbstractRepository<PageModel> {
  constructor(comicId: string, episodeId: string) {
    super(["comics", comicId, "episodes", episodeId, "pages"]);
  }

  public async get(): Promise<Array<PageModel>> {
    return (await this.collectionRef.orderBy("no", "asc").get()).docs.map((documentSnapshot) => {
      const result = documentSnapshot.data() as PageModel;
      result.id = documentSnapshot.id;
      return result;
    });
  }
}
