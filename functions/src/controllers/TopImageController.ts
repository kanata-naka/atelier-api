import * as functions from "firebase-functions";
import { injectable } from "tsyringe";
import AbstractController from "./AbstractController";
import { TOP_IMAGE_MAX_HEIGHT, TOP_IMAGE_MAX_WIDTH, TOP_IMAGE_THUMBNAIL_MAX_WIDTH } from "../constants";
import TopImageModel from "../models/TopImageModel";
import TopImageRepository from "../repositories/TopImageRepository";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";
import GetByIdRequest from "../schemas/GetByIdRequest";
import TopImageBulkUpdateRequest from "../schemas/TopImageBulkUpdateRequest";
import TopImageCreateRequest from "../schemas/TopImageCreateRequest";
import TopImageGetListResponse from "../schemas/TopImageGetListResponse";
import TopImageGetResponse from "../schemas/TopImageGetResponse";
import StorageService from "../services/StorageService";

@injectable()
export default class TopImageController extends AbstractController {
  constructor(
    private topImageRepository: TopImageRepository,
    private storageService: StorageService,
  ) {
    super();
  }

  public async get(): Promise<TopImageGetListResponse> {
    const models: Array<TopImageModel> = await this.topImageRepository.get();
    return {
      result: await Promise.all(models.map(async (model) => await this.createTopImageGetResponse(model))),
    };
  }

  public async getById(data: GetByIdRequest): Promise<TopImageGetResponse> {
    const model: TopImageModel = await this.topImageRepository.getById(data.id);
    return await this.createTopImageGetResponse(model);
  }

  private async createTopImageGetResponse(model: TopImageModel): Promise<TopImageGetResponse> {
    return {
      id: model.id!,
      image: {
        name: model.image.name,
        url: this.storageService.getPublicUrl(model.image.name),
      },
      thumbnailImage: {
        name: model.thumbnailImage.name,
        url: this.storageService.getPublicUrl(model.thumbnailImage.name),
      },
      description: model.description,
      order: model.order,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  public async create(data: TopImageCreateRequest): Promise<void> {
    await this.topImageRepository.create(data);
  }

  public async bulkUpdate(data: TopImageBulkUpdateRequest): Promise<void> {
    await this.topImageRepository.bulkUpdate(data);
  }

  public async onUpdate(change: functions.Change<functions.firestore.DocumentSnapshot>): Promise<void> {
    const before = change.before.data() as TopImageModel;
    const after = change.after.data() as TopImageModel;

    // 古い画像を削除する
    if (before.image.name !== after.image.name) {
      await this.storageService
        .deleteFile(before.image.name)
        .then(() => console.log(`"${before.image.name}" deleted.`))
        .catch(() => console.error(`"${before.image.name}" failed to delete.`));
    }
    if (before.thumbnailImage.name !== after.thumbnailImage.name) {
      await this.storageService
        .deleteFile(before.thumbnailImage.name)
        .then(() => console.log(`"${before.thumbnailImage.name}" deleted.`))
        .catch(() => console.error(`"${before.thumbnailImage.name}" failed to delete.`));
    }
  }

  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.topImageRepository.deleteById(data.id);
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageService.deleteFiles(`topImages/${snapshot.id}`);
    console.log(`"topImages/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    if (
      !this.storageService.isImageFile(object) ||
      !(await this.storageService.needToResizeImageFile(object, TOP_IMAGE_MAX_WIDTH, TOP_IMAGE_MAX_HEIGHT, "cover"))
    ) {
      return;
    }
    // 画像をリサイズする
    await this.storageService.resizeImageFile(object, TOP_IMAGE_MAX_WIDTH, TOP_IMAGE_MAX_HEIGHT, "cover");
    await this.storageService.makePublic(object.name!);
  }

  public async onUploadThumbnailImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    if (
      !this.storageService.isImageFile(object) ||
      !(await this.storageService.needToResizeImageFile(
        object,
        TOP_IMAGE_THUMBNAIL_MAX_WIDTH,
        TOP_IMAGE_THUMBNAIL_MAX_WIDTH,
        "cover",
      ))
    ) {
      return;
    }
    // サムネイル画像をリサイズする
    await this.storageService.resizeImageFile(
      object,
      TOP_IMAGE_THUMBNAIL_MAX_WIDTH,
      TOP_IMAGE_THUMBNAIL_MAX_WIDTH,
      "cover",
    );
    await this.storageService.makePublic(object.name!);
  }
}
