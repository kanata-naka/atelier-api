import { injectable } from "tsyringe";
import TagInfoModel from "../models/TagInfoModel";
import TagInfoRepository from "../repositories/TagInfoRepository";
import GetByIdRequest from "../schemas/GetByIdRequest";
import TagInfoGetResponse from "../schemas/TagInfoGetResponse";
import AbstractController from "./AbstractController";

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
  public async getById(data: GetByIdRequest): Promise<TagInfoGetResponse> {
    const model: TagInfoModel = await this.tagInfoRepository.getById(data.id);
    return {
      info: model.info,
    };
  }
}
