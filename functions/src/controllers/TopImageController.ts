import { injectable } from "tsyringe";
import TopImageModel from "../models/TopImageModel";
import TopImageGetByIdResponse from "../dto/TopImageGetByIdResponse";
import AbstractController from "./AbstractController";
import TopImageRepository from "../repositories/TopImageRepository";
import StorageUtil from "../utils/StorageUtil";
import TopImageGetResponse from "../dto/TopImageGetResponse";
import GetByIdData from "../dto/GetByIdData";
import TopImageCreateData from "../dto/TopImageCreateData";
import TopImageBulkUpdateData from "../dto/TopImageBulkUpdateData";
import DeleteByIdData from "../dto/DeleteByIdData";

/**
 * トップ画像のコントローラ
 */
@injectable()
export default class TopImageController extends AbstractController {
  constructor(
    private topImageRepository: TopImageRepository,
    private storageUtil: StorageUtil
  ) {
    super();
  }

  /**
   * トップ画像の一覧を取得する
   * @param data
   */
  public async get(): Promise<TopImageGetResponse> {
    const models: Array<TopImageModel> = await this.topImageRepository.get();
    return {
      result: await Promise.all(
        models.map(
          async (model) => await this.createTopImageGetByIdResponse(model)
        )
      ),
    };
  }

  /**
   * IDに紐づくトップ画像を取得する
   * @param data
   */
  public async getById(data: GetByIdData): Promise<TopImageGetByIdResponse> {
    const model: TopImageModel = await this.topImageRepository.getById(data.id);
    return await this.createTopImageGetByIdResponse(model);
  }

  private async createTopImageGetByIdResponse(
    model: TopImageModel
  ): Promise<TopImageGetByIdResponse> {
    return {
      id: model.id!,
      image: {
        name: model.image.name,
        url: await this.storageUtil.getFileUrl(model.image.name),
      },
      thumbnailImage: {
        name: model.thumbnailImage.name,
        url: await this.storageUtil.getFileUrl(model.thumbnailImage.name),
      },
      description: model.description,
      order: model.order,
      createdAt: model.createdAt?.seconds,
      updatedAt: model.updatedAt?.seconds,
    };
  }

  /**
   * トップ画像を登録する
   * @param data
   */
  public async create(data: TopImageCreateData) {
    await this.topImageRepository.create(data);
  }

  /**
   * トップ画像を一括で更新する
   * @param data
   */
  public async bulkUpdate(data: TopImageBulkUpdateData) {
    await this.topImageRepository.bulkUpdate(data);
  }

  /**
   * IDに紐づくトップ画像を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdData) {
    await this.storageUtil.deleteFiles(`topImages/${data.id}`);
    await this.topImageRepository.deleteById(data.id);
  }
}