import { injectable } from "tsyringe";
import * as functions from "firebase-functions";
import TopImageModel from "../models/TopImageModel";
import TopImageGetResponse from "../schemas/TopImageGetResponse";
import AbstractController from "./AbstractController";
import TopImageRepository from "../repositories/TopImageRepository";
import StorageUtil from "../utils/StorageUtil";
import TopImageGetListResponse from "../schemas/TopImageGetListResponse";
import GetByIdRequest from "../schemas/GetByIdRequest";
import TopImageCreateRequest from "../schemas/TopImageCreateRequest";
import TopImageBulkUpdateRequest from "../schemas/TopImageBulkUpdateRequest";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";

/**
 * トップ画像のコントローラ
 */
@injectable()
export default class TopImageController extends AbstractController {
  private static readonly IMAGE_MAX_WIDTH: number = 1600;
  private static readonly IMAGE_MAX_HEIGHT: number = 960;
  private static readonly THUMBNAIL_IMAGE_MAX_WIDTH: number = 32;

  constructor(private topImageRepository: TopImageRepository, private storageUtil: StorageUtil) {
    super();
  }

  /**
   * トップ画像の一覧を取得する
   * @param data
   */
  public async get(): Promise<TopImageGetListResponse> {
    const models: Array<TopImageModel> = await this.topImageRepository.get();
    return {
      result: await Promise.all(models.map(async (model) => await this.createTopImageGetResponse(model))),
    };
  }

  /**
   * IDに紐づくトップ画像を取得する
   * @param data
   */
  public async getById(data: GetByIdRequest): Promise<TopImageGetResponse> {
    const model: TopImageModel = await this.topImageRepository.getById(data.id);
    return await this.createTopImageGetResponse(model);
  }

  private async createTopImageGetResponse(model: TopImageModel): Promise<TopImageGetResponse> {
    return {
      id: model.id!,
      image: {
        name: model.image.name,
        // url: await this.storageUtil.getSignedUrl(model.image.name),
        url: this.storageUtil.getPublicUrl(model.image.name),
      },
      thumbnailImage: {
        name: model.thumbnailImage.name,
        // url: await this.storageUtil.getSignedUrl(model.thumbnailImage.name),
        url: this.storageUtil.getPublicUrl(model.thumbnailImage.name),
      },
      description: model.description,
      order: model.order,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  /**
   * トップ画像を登録する
   * @param data
   */
  public async create(data: TopImageCreateRequest): Promise<void> {
    await this.topImageRepository.create(data);
  }

  /**
   * トップ画像を一括で更新する
   * @param data
   */
  public async bulkUpdate(data: TopImageBulkUpdateRequest): Promise<void> {
    await this.topImageRepository.bulkUpdate(data);
  }

  /**
   * トップ画像の更新時に実行する
   * @param change
   */
  public async onUpdate(change: functions.Change<functions.firestore.DocumentSnapshot>): Promise<void> {
    const before = change.before.data() as TopImageModel;
    const after = change.after.data() as TopImageModel;

    // 古い画像を削除する
    if (before.image.name !== after.image.name) {
      await this.storageUtil
        .deleteFile(before.image.name)
        .then(() => console.log(`"${before.image.name}" deleted.`))
        .catch(() => console.error(`"${before.image.name}" failed to delete.`));
    }
    if (before.thumbnailImage.name !== after.thumbnailImage.name) {
      await this.storageUtil
        .deleteFile(before.thumbnailImage.name)
        .then(() => console.log(`"${before.thumbnailImage.name}" deleted.`))
        .catch(() => console.error(`"${before.thumbnailImage.name}" failed to delete.`));
    }
  }

  /**
   * IDに紐づくトップ画像を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.topImageRepository.deleteById(data.id);
  }

  /**
   * トップ画像の削除時に実行する
   * @param snapshot
   */
  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageUtil.deleteFiles(`topImages/${snapshot.id}`);
    console.log(`"topImages/${snapshot.id}" deleted.`);
  }

  /**
   * 画像のアップロード時に実行する
   * @param object
   */
  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    if (
      !this.storageUtil.isImageFile(object) ||
      !(await this.storageUtil.needToResizeImageFile(
        object,
        TopImageController.IMAGE_MAX_WIDTH,
        TopImageController.IMAGE_MAX_HEIGHT,
        "cover"
      ))
    ) {
      return;
    }
    // 画像をリサイズする
    await this.storageUtil.resizeImageFile(
      object,
      TopImageController.IMAGE_MAX_WIDTH,
      TopImageController.IMAGE_MAX_HEIGHT,
      "cover"
    );
    await this.storageUtil.makePublic(object.name!);
  }

  /**
   * サムネイル画像のアップロード時に実行する
   * @param object
   */
  public async onUploadThumbnailImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    if (
      !this.storageUtil.isImageFile(object) ||
      !(await this.storageUtil.needToResizeImageFile(
        object,
        TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
        TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
        "cover"
      ))
    ) {
      return;
    }
    // サムネイル画像をリサイズする
    await this.storageUtil.resizeImageFile(
      object,
      TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
      TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
      "cover"
    );
    await this.storageUtil.makePublic(object.name!);
  }
}
