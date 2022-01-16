import { injectable } from "tsyringe";
import TagInfoRepository from "../repositories/TagInfoRepository";
import TagInfoModel from "../models/TagInfoModel";
import TagInfoGetResponse from "../schemas/TagInfoGetResponse";
import AbstractController from "./AbstractController";
import GetByIdData from "../schemas/GetByIdData";

/**
 * タグ情報のコントローラ
 */
@injectable()
export default class TagInfoController extends AbstractController {
  constructor(private tagInfoRepository: TagInfoRepository) {
    super();
  }

  /**
   * IDに紐づくタグ情報を取得する
   * @param data
   */
  public async getById(data: GetByIdData): Promise<TagInfoGetResponse> {
    const model: TagInfoModel = await this.tagInfoRepository.getById(data.id);
    return {
      info: model.info,
    };
  }
}
