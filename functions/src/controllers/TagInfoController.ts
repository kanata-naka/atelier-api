import { injectable } from "tsyringe";
import AbstractController from "./AbstractController";
import TagInfoModel from "../models/TagInfoModel";
import TagInfoRepository from "../repositories/TagInfoRepository";
import GetByIdRequest from "../schemas/GetByIdRequest";
import TagInfoGetResponse from "../schemas/TagInfoGetResponse";

@injectable()
export default class TagInfoController extends AbstractController {
  constructor(private tagInfoRepository: TagInfoRepository) {
    super();
  }

  public async getById(data: GetByIdRequest): Promise<TagInfoGetResponse> {
    const model: TagInfoModel = await this.tagInfoRepository.getById(data.id);
    return {
      info: model.info,
    };
  }
}
