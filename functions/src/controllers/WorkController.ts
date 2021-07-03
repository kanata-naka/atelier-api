import { injectable } from "tsyringe";
import * as functions from "firebase-functions";
import WorkModel from "../models/WorkModel";
import WorkGetByIdResponse from "../dto/WorkGetByIdResponse";
import AbstractController from "./AbstractController";
import WorkRepository from "../repositories/WorkRepository";
import StorageUtil from "../utils/StorageUtil";
import WorkGetResponse from "../dto/WorkGetResponse";
import WorkGetData from "../dto/WorkGetData";
import GetByIdData from "../dto/GetByIdData";
import WorkUpdateData from "../dto/WorkUpdateData";
import DeleteByIdData from "../dto/DeleteByIdData";
import WorkCreateData from "../dto/WorkCreateData";

/**
 * 作品のコントローラ
 */
@injectable()
export default class WorkController extends AbstractController {
  private static readonly IMAGE_SMALL_NAME_SUFFIX: string = "_small";
  private static readonly IMAGE_SMALL_MAX_WIDTH: number = 64;
  private static readonly IMAGE_MAX_WIDTH: number = 1200;

  constructor(
    private workRepository: WorkRepository,
    private storageUtil: StorageUtil
  ) {
    super();
  }

  /**
   * 作品の一覧を取得する
   * @param data
   */
  public async get(data: WorkGetData): Promise<WorkGetResponse> {
    const models: Array<WorkModel> = await this.workRepository.get(data);
    return {
      result: await Promise.all(
        models.map(async (model) => await this.createWorkGetByIdResponse(model))
      ),
    };
  }

  /**
   * IDに紐づく作品を取得する
   * @param data
   */
  public async getById(data: GetByIdData): Promise<WorkGetByIdResponse> {
    const model: WorkModel = await this.workRepository.getById(data.id);
    return await this.createWorkGetByIdResponse(model);
  }

  private async createWorkGetByIdResponse(
    model: WorkModel
  ): Promise<WorkGetByIdResponse> {
    return {
      id: model.id!,
      title: model.title,
      publishedDate: model.publishedDate?.seconds,
      images: await Promise.all(
        model.images.map(async (image) => {
          return {
            name: image.name,
            // url: await this.storageUtil.getSignedUrl(image.name),
            url: this.storageUtil.getPublicUrl(image.name),
            thumbnailUrl: {
              small: await this.getThumbnailUrl(
                image.name,
                WorkController.IMAGE_SMALL_NAME_SUFFIX
              ),
            },
          };
        })
      ),
      description: model.description,
      restrict: model.restrict,
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
   * 作品を登録する
   * @param data
   */
  public async create(data: WorkCreateData) {
    const model: WorkModel = {
      ...data,
      publishedDate: this.workRepository.createTimestamp(data.publishedDate),
    };
    await this.workRepository.create(model);
  }

  /**
   * 作品を更新する
   * @param data
   */
  public async update(data: WorkUpdateData) {
    const model: WorkModel = {
      ...data,
      publishedDate: this.workRepository.createTimestamp(data.publishedDate),
    };
    await this.workRepository.update(model);
  }

  public async onUpdate(
    change: functions.Change<functions.firestore.DocumentSnapshot>
  ) {
    const before = change.before.data() as WorkModel;
    const after = change.after.data() as WorkModel;
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
            WorkController.IMAGE_SMALL_NAME_SUFFIX
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
   * IDに紐づく作品を削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdData) {
    await this.workRepository.deleteById(data.id);
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot) {
    await this.storageUtil.deleteFiles(`works/${snapshot.id}`);
    console.log(`"works/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata) {
    const name = object.name!;

    if (
      name.includes(WorkController.IMAGE_SMALL_NAME_SUFFIX) ||
      !this.storageUtil.isImageFile(object)
    ) {
      return;
    }

    // サムネイル画像（小）を生成する
    let smallImageName = this.storageUtil.addSuffix(
      name,
      WorkController.IMAGE_SMALL_NAME_SUFFIX
    );
    if (!(await this.storageUtil.exists(smallImageName))) {
      await this.storageUtil.resizeImageFile(
        object,
        WorkController.IMAGE_SMALL_MAX_WIDTH,
        WorkController.IMAGE_SMALL_MAX_WIDTH,
        "inside",
        smallImageName
      );
      await this.storageUtil.makePublic(smallImageName);
    }

    // 画像をリサイズする
    if (
      await this.storageUtil.needToResizeImageFile(
        object,
        WorkController.IMAGE_MAX_WIDTH,
        WorkController.IMAGE_MAX_WIDTH,
        "inside"
      )
    ) {
      await this.storageUtil.resizeImageFile(
        object,
        WorkController.IMAGE_MAX_WIDTH,
        WorkController.IMAGE_MAX_WIDTH,
        "inside"
      );
      await this.storageUtil.makePublic(name);
    }
  }
}
