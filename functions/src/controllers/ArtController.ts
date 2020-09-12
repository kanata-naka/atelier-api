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
  private static readonly IMAGE_SMALL_NAME_SUFFIX: string = "_small";
  private static readonly IMAGE_SMALL_MAX_WIDTH: number = 64;
  private static readonly IMAGE_MEDIUM_NAME_SUFFIX: string = "_medium";
  private static readonly IMAGE_MEDIUM_MAX_WIDTH: number = 720;

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
            // url: await this.storageUtil.getSignedUrl(image.name),
            url: this.storageUtil.getPublicUrl(image.name),
            thumbnailUrl: {
              small: await this.getThumbnailUrl(
                image.name,
                ArtController.IMAGE_SMALL_NAME_SUFFIX
              ),
              medium: await this.getThumbnailUrl(
                image.name,
                ArtController.IMAGE_MEDIUM_NAME_SUFFIX
              ),
            },
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
   * サムネイル画像のURLを取得する
   */
  private async getThumbnailUrl(name: string, suffix: string) {
    // return await this.storageUtil.getSignedUrl(
    return this.storageUtil.getPublicUrl(
      this.storageUtil.addSuffix(name, suffix)
    );
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
    for (let beforeImage of before.images) {
      if (
        after.images.find((afterImage) => afterImage.name === beforeImage.name)
      ) {
        continue;
      }
      await Promise.all(
        [
          beforeImage.name,
          this.storageUtil.addSuffix(
            beforeImage.name,
            ArtController.IMAGE_SMALL_NAME_SUFFIX
          ),
          this.storageUtil.addSuffix(
            beforeImage.name,
            ArtController.IMAGE_MEDIUM_NAME_SUFFIX
          ),
        ].map((name) =>
          this.storageUtil
            .deleteFile(name)
            .then(() => console.log(`"${name}" deleted.`))
            .catch(() => console.error(`"${name}" failed to delete.`))
        )
      );
    }
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
    if (
      object.name!.includes(ArtController.IMAGE_SMALL_NAME_SUFFIX) ||
      object.name!.includes(ArtController.IMAGE_MEDIUM_NAME_SUFFIX)
    ) {
      return;
    }
    if (!this.storageUtil.isImageFile(object)) {
      return;
    }
    await this.storageUtil.makePublic(object.name!);

    // サムネイル画像（小）を生成する
    const smallImageName = this.storageUtil.addSuffix(
      object.name!,
      ArtController.IMAGE_SMALL_NAME_SUFFIX
    );
    await this.storageUtil.resizeImageFile(
      object,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      "inside",
      smallImageName
    );
    await this.storageUtil.makePublic(smallImageName);

    // サムネイル画像（中）を生成する
    const mediumImageName = this.storageUtil.addSuffix(
      object.name!,
      ArtController.IMAGE_MEDIUM_NAME_SUFFIX
    );
    await this.storageUtil.resizeImageFile(
      object,
      ArtController.IMAGE_MEDIUM_MAX_WIDTH,
      ArtController.IMAGE_MEDIUM_MAX_WIDTH,
      "inside",
      mediumImageName
    );
    await this.storageUtil.makePublic(mediumImageName);
  }
}
