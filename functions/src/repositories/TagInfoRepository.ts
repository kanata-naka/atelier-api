import AbstractRepository from "./AbstractRepository";
import TagInfoModel from "../models/TagInfoModel";

/**
 * タグ情報のリポジトリ
 */
export default class TagInfoRepository extends AbstractRepository<
  TagInfoModel
> {
  constructor() {
    super("tagInfo");
  }
}
