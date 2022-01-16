import { injectable } from "tsyringe";
import * as functions from "firebase-functions";
import ArtModel from "../models/ArtModel";
import ArtGetResponse from "../schemas/ArtGetResponse";
import AbstractController from "./AbstractController";
import ArtRepository from "../repositories/ArtRepository";
import StorageUtil from "../utils/StorageUtil";
import ArtGetListResponse from "../schemas/ArtGetListResponse";
import ArtGetListRequest from "../schemas/ArtGetListRequest";
import GetByIdRequest from "../schemas/GetByIdRequest";
import ArtCreateRequest from "../schemas/ArtCreateRequest";
import ArtUpdateRequest from "../schemas/ArtUpdateRequest";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";
import TagInfoRepository from "../repositories/TagInfoRepository";

/**
 * アートのコントローラ
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
   * アートの一覧を取得する
   * @param data
   */
  public async get(data: ArtGetListRequest): Promise<ArtGetListResponse> {
    const models: Array<ArtModel> = await this.artRepository.get(data);
    const result = await Promise.all(models.map(async (model) => await this.createArtGetResponse(model)));
    return {
      result,
      fetchedAll: data && data.limit ? result.length < data.limit : false,
    };
  }

  /**
   * IDに紐づくアートを取得する
   * @param data
   */
  public async getById(data: GetByIdRequest): Promise<ArtGetResponse> {
    const model: ArtModel = await this.artRepository.getById(data.id);
    return await this.createArtGetResponse(model);
  }

  private async createArtGetResponse(model: ArtModel): Promise<ArtGetResponse> {
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
              small: await this.getThumbnailUrl(image.name, ArtController.IMAGE_SMALL_NAME_SUFFIX),
              medium: await this.getThumbnailUrl(image.name, ArtController.IMAGE_MEDIUM_NAME_SUFFIX),
            },
          };
        })
      ),
      restrict: model.restrict,
      description: model.description,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  /**
   * サムネイル画像のURLを取得する
   */
  private async getThumbnailUrl(name: string, suffix: string): Promise<string> {
    // return await this.storageUtil.getSignedUrl(
    return this.storageUtil.getPublicUrl(this.storageUtil.addSuffix(name, suffix));
  }

  /**
   * アートを登録する
   * @param data
   */
  public async create(data: ArtCreateRequest): Promise<void> {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt ? this.artRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.artRepository.create(model);
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  /**
   * アートを更新する
   * @param data
   */
  public async update(data: ArtUpdateRequest): Promise<void> {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt ? this.artRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.artRepository.update(model);
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  /**
   * アートの更新時に実行する
   * @param change
   */
  public async onUpdate(change: functions.Change<functions.firestore.DocumentSnapshot>): Promise<void> {
    const before = change.before.data() as ArtModel;
    const after = change.after.data() as ArtModel;

    // 古い画像を削除する
    for (const beforeImage of before.images) {
      if (after.images.find((afterImage) => afterImage.name === beforeImage.name)) {
        continue;
      }
      await Promise.all(
        [
          beforeImage.name,
          this.storageUtil.addSuffix(beforeImage.name, ArtController.IMAGE_SMALL_NAME_SUFFIX),
          this.storageUtil.addSuffix(beforeImage.name, ArtController.IMAGE_MEDIUM_NAME_SUFFIX),
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
   * IDに紐づくアートを削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.artRepository.deleteById(data.id);
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  /**
   * アートの削除時に実行する
   * @param snapshot
   */
  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageUtil.deleteFiles(`arts/${snapshot.id}`);
    console.log(`"arts/${snapshot.id}" deleted.`);
  }

  /**
   * 画像のアップロード時に実行する
   * @param object
   */
  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    const name = object.name!;

    if (name.includes(ArtController.IMAGE_SMALL_NAME_SUFFIX) || name.includes(ArtController.IMAGE_MEDIUM_NAME_SUFFIX)) {
      return;
    }
    if (!this.storageUtil.isImageFile(object)) {
      return;
    }
    await this.storageUtil.makePublic(name);

    // サムネイル画像（小）を生成する
    const smallImageName = this.storageUtil.addSuffix(name, ArtController.IMAGE_SMALL_NAME_SUFFIX);
    await this.storageUtil.resizeImageFile(
      object,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      ArtController.IMAGE_SMALL_MAX_WIDTH,
      "inside",
      smallImageName
    );
    await this.storageUtil.makePublic(smallImageName);

    // サムネイル画像（中）を生成する
    const mediumImageName = this.storageUtil.addSuffix(name, ArtController.IMAGE_MEDIUM_NAME_SUFFIX);
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
