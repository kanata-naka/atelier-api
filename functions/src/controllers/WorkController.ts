import { injectable } from "tsyringe";
import WorkModel from "../models/WorkModel";
import WorkGetByIdResponse from "../dto/WorkGetByIdResponse";
import AbstractController from "./AbstractController";
import WorkRepository from "../repositories/WorkRepository";
import StorageUtil from "../utils/StorageUtil";
import WorkGetResponse from "../dto/WorkGetResponse";
import WorkGetData from "../dto/WorkGetData";
import GetByIdData from "../dto/GetByIdData";

/**
 * 作品のコントローラ
 */
@injectable()
export default class WorkController extends AbstractController {
  constructor(
    private workRepository: WorkRepository,
    private storageUtil: StorageUtil
  ) {
    super();
  }

  /**
   * 作品の一覧を取得する
   * @param data
   */
  public async get(data: WorkGetData): Promise<WorkGetResponse> {
    const models: Array<WorkModel> = await this.workRepository.get(data);
    return {
      result: await Promise.all(
        models.map(async (model) => await this.createWorkGetByIdResponse(model))
      ),
    };
  }

  /**
   * IDに紐づく作品を取得する
   * @param data
   */
  public async getById(data: GetByIdData): Promise<WorkGetByIdResponse> {
    const model: WorkModel = await this.workRepository.getById(data.id);
    return await this.createWorkGetByIdResponse(model);
  }

  private async createWorkGetByIdResponse(
    model: WorkModel
  ): Promise<WorkGetByIdResponse> {
    return {
      id: model.id!,
      title: model.title,
      images: await Promise.all(
        model.images.map(async (image) => {
          return {
            name: image.name,
            url: await this.storageUtil.getFileUrl(image.name),
          };
        })
      ),
      description: model.description,
      pickupFlag: model.pickupFlag,
      createdAt: model.createdAt?._seconds,
      updatedAt: model.updatedAt?._seconds,
    };
  }
}
