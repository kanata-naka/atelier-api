import * as functions from "firebase-functions";
import { injectable } from "tsyringe";
import AbstractController from "./AbstractController";
import {
  IMAGE_SMALL_NAME_SUFFIX,
  IMAGE_MEDIUM_NAME_SUFFIX,
  ART_IMAGE_MEDIUM_MAX_WIDTH,
  ART_IMAGE_SMALL_MAX_WIDTH,
} from "../constants";
import ArtModel from "../models/ArtModel";
import ArtRepository from "../repositories/ArtRepository";
import TagInfoRepository from "../repositories/TagInfoRepository";
import ArtCreateRequest from "../schemas/ArtCreateRequest";
import ArtGetListRequest from "../schemas/ArtGetListRequest";
import ArtGetListResponse from "../schemas/ArtGetListResponse";
import ArtGetResponse from "../schemas/ArtGetResponse";
import ArtUpdateRequest from "../schemas/ArtUpdateRequest";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";
import GetByIdRequest from "../schemas/GetByIdRequest";
import StorageUtil from "../utils/StorageUtil";

@injectable()
export default class ArtController extends AbstractController {
  constructor(
    private artRepository: ArtRepository,
    private tagInfoRepository: TagInfoRepository,
    private storageUtil: StorageUtil,
  ) {
    super();
  }

  public async get(data: ArtGetListRequest): Promise<ArtGetListResponse> {
    const models: Array<ArtModel> = await this.artRepository.get(data);
    const result = await Promise.all(models.map(async (model) => await this.createArtGetResponse(model)));
    return {
      result,
      fetchedAll: data && data.limit ? result.length < data.limit : false,
    };
  }

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
            url: this.storageUtil.getPublicUrl(image.name),
            thumbnailUrl: {
              small: await this.getThumbnailUrl(image.name, IMAGE_SMALL_NAME_SUFFIX),
              medium: await this.getThumbnailUrl(image.name, IMAGE_MEDIUM_NAME_SUFFIX),
            },
          };
        }),
      ),
      restrict: model.restrict,
      description: model.description,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  private async getThumbnailUrl(name: string, suffix: string): Promise<string> {
    return this.storageUtil.getPublicUrl(this.storageUtil.addSuffix(name, suffix));
  }

  public async create(data: ArtCreateRequest): Promise<void> {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt ? this.artRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.artRepository.create(model);
    // タグ情報を最新化する
    await this.tagInfoRepository.aggregateById("arts");
  }

  public async update(data: ArtUpdateRequest): Promise<void> {
    const model: ArtModel = {
      ...data,
      createdAt: data.createdAt ? this.artRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.artRepository.update(model);
    // タグ情報を最新化する
    await this.tagInfoRepository.aggregateById("arts");
  }

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
          this.storageUtil.addSuffix(beforeImage.name, IMAGE_SMALL_NAME_SUFFIX),
          this.storageUtil.addSuffix(beforeImage.name, IMAGE_MEDIUM_NAME_SUFFIX),
        ].map((name) =>
          this.storageUtil
            .deleteFile(name)
            .then(() => console.log(`"${name}" deleted.`))
            .catch(() => console.error(`"${name}" failed to delete.`)),
        ),
      );
    }
  }

  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.artRepository.deleteById(data.id);
    // タグ情報を最新化する
    await this.tagInfoRepository.aggregateById("arts");
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageUtil.deleteFiles(`arts/${snapshot.id}`);
    console.log(`"arts/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    const name = object.name!;

    if (name.includes(IMAGE_SMALL_NAME_SUFFIX) || name.includes(IMAGE_MEDIUM_NAME_SUFFIX)) {
      return;
    }
    if (!this.storageUtil.isImageFile(object)) {
      return;
    }
    await this.storageUtil.makePublic(name);

    // サムネイル画像（小）を生成する
    const smallImageName = this.storageUtil.addSuffix(name, IMAGE_SMALL_NAME_SUFFIX);
    await this.storageUtil.resizeImageFile(
      object,
      ART_IMAGE_SMALL_MAX_WIDTH,
      ART_IMAGE_SMALL_MAX_WIDTH,
      "inside",
      smallImageName,
    );
    await this.storageUtil.makePublic(smallImageName);

    // サムネイル画像（中）を生成する
    const mediumImageName = this.storageUtil.addSuffix(name, IMAGE_MEDIUM_NAME_SUFFIX);
    await this.storageUtil.resizeImageFile(
      object,
      ART_IMAGE_MEDIUM_MAX_WIDTH,
      ART_IMAGE_MEDIUM_MAX_WIDTH,
      "inside",
      mediumImageName,
    );
    await this.storageUtil.makePublic(mediumImageName);
  }
}
