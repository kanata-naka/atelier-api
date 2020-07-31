import { injectable } from "tsyringe";
import * as functions from "firebase-functions";
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
import TagInfoRepository from "../repositories/TagInfoRepository";

/**
 * アート（イラスト）のコントローラ
 */
@injectable()
export default class ArtController extends AbstractController {
  private static readonly IMAGE_SMALL_MAX_WIDTH: number = 64;
  private static readonly IMAGE_MEDIUM_MAX_WIDTH: number = 640;

  constructor(
    private artRepository: ArtRepository,
    private tagInfoRepository: TagInfoRepository,
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
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
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
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  public async onUpdate(
    change: functions.Change<functions.firestore.DocumentSnapshot>
  ) {
    const before = change.before.data() as ArtModel;
    const after = change.after.data() as ArtModel;
    await Promise.all(
      before.images.map(async (beforeImage) => {
        if (
          !after.images.find(
            (afterImage) => afterImage.name === beforeImage.name
          )
        ) {
          await this.storageUtil.deleteFile(beforeImage.name);
          console.log(`"${beforeImage.name}" deleted.`);
        }
      })
    );
  }

  /**
   * IDに紐づくアート（イラスト）を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdData) {
    await this.artRepository.deleteById(data.id);
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot) {
    await this.storageUtil.deleteFiles(`arts/${snapshot.id}`);
    console.log(`"arts/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata) {
    if (object.name!.includes("_small") || object.name!.includes("_medium")) {
      return;
    }
    if (!this.storageUtil.isImageFile(object)) {
      return;
    }
    // サムネイル画像（小、中）を生成する
    await this.storageUtil.resizeImageFile(
      object,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      "inside",
      this.storageUtil.getThumbnailImageName(object.name!, "_small")
    );
    await this.storageUtil.resizeImageFile(
      object,
      ArtController.IMAGE_MEDIUM_MAX_WIDTH,
      ArtController.IMAGE_MEDIUM_MAX_WIDTH,
      "inside",
      this.storageUtil.getThumbnailImageName(object.name!, "_medium")
    );
  }
}
