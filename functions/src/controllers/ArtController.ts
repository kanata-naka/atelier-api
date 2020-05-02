import { injectable } from "tsyringe";
import ArtModel from "../models/ArtModel";
import ArtGetByIdResponse from "../dto/ArtGetByIdResponse";
import AbstractController from "./AbstractController";
import ArtRepository from "../repositories/ArtRepository";
import StorageUtil from "../utils/StorageUtil";
import ArtGetResponse from "../dto/ArtGetResponse";
import ArtGetData from "../dto/ArtGetData";
import GetByIdData from "../dto/GetByIdData";

/**
 * アート（イラスト）のコントローラ
 */
@injectable()
export default class ArtController extends AbstractController {
  constructor(
    private artRepository: ArtRepository,
    private storageUtil: StorageUtil
  ) {
    super();
  }

  /**
   * アート（イラスト）の一覧を取得する
   * @param data
   */
  public async get(data: ArtGetData): Promise<ArtGetResponse> {
    const models: Array<ArtModel> = await this.artRepository.get(data);
    const result = await Promise.all(
      models.map(async (model) => await this.createArtGetByIdResponse(model))
    );
    return {
      result,
      fetchedAll: data && data.limit ? result.length < data.limit : false,
    };
  }

  /**
   * IDに紐づくアート（イラスト）を取得する
   * @param data
   */
  public async getById(data: GetByIdData): Promise<ArtGetByIdResponse> {
    const model: ArtModel = await this.artRepository.getById(data.id);
    return await this.createArtGetByIdResponse(model);
  }

  private async createArtGetByIdResponse(
    model: ArtModel
  ): Promise<ArtGetByIdResponse> {
    return {
      id: model.id!,
      title: model.title,
      tags: model.tags,
      images: await Promise.all(
        model.images.map(async (image) => {
          return {
            name: image.name,
            url: await this.storageUtil.getFileUrl(image.name),
          };
        })
      ),
      description: model.description,
      createdAt: model.createdAt?._seconds,
      updatedAt: model.updatedAt?._seconds,
    };
  }
}
