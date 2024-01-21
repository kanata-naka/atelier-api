import * as functions from "firebase-functions";
import { injectable } from "tsyringe";
import AbstractController from "./AbstractController";
import { IMAGE_SMALL_NAME_SUFFIX, WORK_IMAGE_MAX_WIDTH, WORK_IMAGE_SMALL_MAX_WIDTH } from "../constants";
import WorkModel from "../models/WorkModel";
import WorkRepository from "../repositories/WorkRepository";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";
import GetByIdRequest from "../schemas/GetByIdRequest";
import WorkCreateRequest from "../schemas/WorkCreateRequest";
import WorkGetRequest from "../schemas/WorkGetListRequest";
import WorkGetListResponse from "../schemas/WorkGetListResponse";
import WorkGetResponse from "../schemas/WorkGetResponse";
import WorkUpdateRequest from "../schemas/WorkUpdateRequest";
import StorageUtil from "../utils/StorageUtil";

/**
 * 作品のコントローラ
 */
@injectable()
export default class WorkController extends AbstractController {
  constructor(
    private workRepository: WorkRepository,
    private storageUtil: StorageUtil,
  ) {
    super();
  }

  public async get(data: WorkGetRequest): Promise<WorkGetListResponse> {
    const models: Array<WorkModel> = await this.workRepository.get(data);
    return {
      result: await Promise.all(models.map(async (model) => await this.createWorkGetResponse(model))),
    };
  }

  public async getById(data: GetByIdRequest): Promise<WorkGetResponse> {
    const model: WorkModel = await this.workRepository.getById(data.id);
    return await this.createWorkGetResponse(model);
  }

  private async createWorkGetResponse(model: WorkModel): Promise<WorkGetResponse> {
    return {
      id: model.id!,
      title: model.title,
      publishedDate: model.publishedDate.seconds,
      images: await Promise.all(
        model.images.map(async (image) => {
          return {
            name: image.name,
            url: this.storageUtil.getPublicUrl(image.name),
            thumbnailUrl: {
              small: await this.getThumbnailUrl(image.name, IMAGE_SMALL_NAME_SUFFIX),
            },
          };
        }),
      ),
      description: model.description,
      restrict: model.restrict,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  private async getThumbnailUrl(name: string, suffix: string) {
    return this.storageUtil.getPublicUrl(this.storageUtil.addSuffix(name, suffix));
  }

  public async create(data: WorkCreateRequest): Promise<void> {
    const model: WorkModel = {
      ...data,
      publishedDate: this.workRepository.createTimestamp(data.publishedDate),
    };
    await this.workRepository.create(model);
  }

  public async update(data: WorkUpdateRequest): Promise<void> {
    const model: WorkModel = {
      ...data,
      publishedDate: this.workRepository.createTimestamp(data.publishedDate),
    };
    await this.workRepository.update(model);
  }

  public async onUpdate(change: functions.Change<functions.firestore.DocumentSnapshot>): Promise<void> {
    const before = change.before.data() as WorkModel;
    const after = change.after.data() as WorkModel;

    // 古い画像を削除する
    for (const beforeImage of before.images) {
      if (after.images.find((afterImage) => afterImage.name === beforeImage.name)) {
        continue;
      }
      await Promise.all(
        [beforeImage.name, this.storageUtil.addSuffix(beforeImage.name, IMAGE_SMALL_NAME_SUFFIX)].map((name) =>
          this.storageUtil
            .deleteFile(name)
            .then(() => console.log(`"${name}" deleted.`))
            .catch(() => console.error(`"${name}" failed to delete.`)),
        ),
      );
    }
  }

  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.workRepository.deleteById(data.id);
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageUtil.deleteFiles(`works/${snapshot.id}`);
    console.log(`"works/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    const name = object.name!;

    if (name.includes(IMAGE_SMALL_NAME_SUFFIX) || !this.storageUtil.isImageFile(object)) {
      return;
    }

    // サムネイル画像（小）を生成する
    const smallImageName = this.storageUtil.addSuffix(name, IMAGE_SMALL_NAME_SUFFIX);
    if (!(await this.storageUtil.exists(smallImageName))) {
      await this.storageUtil.resizeImageFile(
        object,
        WORK_IMAGE_SMALL_MAX_WIDTH,
        WORK_IMAGE_SMALL_MAX_WIDTH,
        "inside",
        smallImageName,
      );
      await this.storageUtil.makePublic(smallImageName);
    }

    // 画像をリサイズする
    if (await this.storageUtil.needToResizeImageFile(object, WORK_IMAGE_MAX_WIDTH, WORK_IMAGE_MAX_WIDTH, "inside")) {
      await this.storageUtil.resizeImageFile(object, WORK_IMAGE_MAX_WIDTH, WORK_IMAGE_MAX_WIDTH, "inside");
      await this.storageUtil.makePublic(name);
    }
  }
}
