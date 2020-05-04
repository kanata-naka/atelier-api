import { injectable } from "tsyringe";
import ArtModel from "../models/ArtModel";
import ArtGetByIdResponse from "../dto/ArtGetByIdResponse";
import AbstractController from "./AbstractController";
import ArtRepository from "../repositories/ArtRepository";
import StorageUtil from "../utils/StorageUtil";
import ArtGetResponse from "../dto/ArtGetResponse";
import ArtGetData from "../dto/ArtGetData";
import GetByIdData from "../dto/GetByIdData";
import ArtCreateData from "../dto/ArtCreateData";
import ArtUpdateData from "../dto/ArtUpdateData";
import DeleteByIdData from "../dto/DeleteByIdData";

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
      pickupFlag: model.pickupFlag,
      description: model.description,
      createdAt: model.createdAt?.seconds,
      updatedAt: model.updatedAt?.seconds,
    };
  }

  /**
   * アート（イラスト）を登録する
   * @param data
   */
  public async create(data: ArtCreateData) {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt
        ? this.artRepository.createTimestamp(data.createdAt)
        : undefined,
    };
    await this.artRepository.create(model);
  }

  /**
   * アート（イラスト）を更新する
   * @param data
   */
  public async update(data: ArtUpdateData) {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt
        ? this.artRepository.createTimestamp(data.createdAt)
        : undefined,
    };
    await this.artRepository.update(model);
  }

  /**
   * IDに紐づくアート（イラスト）を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdData) {
    await this.storageUtil.deleteFiles(`arts/${data.id}`);
    await this.artRepository.deleteById(data.id);
  }
}
