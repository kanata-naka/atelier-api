import { injectable } from "tsyringe";
import * as functions from "firebase-functions";
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
  private static readonly IMAGE_MAX_WIDTH: number = 1920;
  private static readonly IMAGE_MAX_HEIGHT: number = 1152;
  private static readonly THUMBNAIL_IMAGE_MAX_WIDTH: number = 32;

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

  public async onUpdate(
    change: functions.Change<functions.firestore.DocumentSnapshot>
  ) {
    const before = change.before.data() as TopImageModel;
    const after = change.after.data() as TopImageModel;
    if (before.image.name !== after.image.name) {
      await this.storageUtil.deleteFile(before.image.name);
      console.log(`"${before.image.name}" deleted.`);
    }
    if (before.thumbnailImage.name !== after.thumbnailImage.name) {
      await this.storageUtil.deleteFile(before.thumbnailImage.name);
      console.log(`"${before.thumbnailImage.name}" deleted.`);
    }
  }

  /**
   * IDに紐づくトップ画像を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdData) {
    await this.topImageRepository.deleteById(data.id);
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot) {
    await this.storageUtil.deleteFiles(`topImages/${snapshot.id}`);
    console.log(`"topImages/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata) {
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
    return await this.storageUtil.resizeImageFile(
      object,
      TopImageController.IMAGE_MAX_WIDTH,
      TopImageController.IMAGE_MAX_HEIGHT,
      "cover"
    );
  }

  public async onUploadThumbnailImageFile(
    object: functions.storage.ObjectMetadata
  ) {
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
    return await this.storageUtil.resizeImageFile(
      object,
      TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
      TopImageController.THUMBNAIL_IMAGE_MAX_WIDTH,
      "cover"
    );
  }
}
