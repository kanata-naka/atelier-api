import * as functions from "firebase-functions";
import { injectable } from "tsyringe";
import {
  IMAGE_MEDIUM_MAX_WIDTH,
  IMAGE_MEDIUM_NAME_SUFFIX,
  IMAGE_SMALL_MAX_WIDTH,
  IMAGE_SMALL_NAME_SUFFIX,
} from "../constants/arts";
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
import AbstractController from "./AbstractController";

/**
 * イラストのコントローラ
 */
@injectable()
export default class ArtController extends AbstractController {
  constructor(
    private artRepository: ArtRepository,
    private tagInfoRepository: TagInfoRepository,
    private storageUtil: StorageUtil
  ) {
    super();
  }

  /**
   * イラストの一覧を取得する
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
   * IDに紐づくイラストを取得する
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
              small: await this.getThumbnailUrl(image.name, IMAGE_SMALL_NAME_SUFFIX),
              medium: await this.getThumbnailUrl(image.name, IMAGE_MEDIUM_NAME_SUFFIX),
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
   * イラストを登録する
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
   * イラストを更新する
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
   * イラストの更新時に実行する
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
          this.storageUtil.addSuffix(beforeImage.name, IMAGE_SMALL_NAME_SUFFIX),
          this.storageUtil.addSuffix(beforeImage.name, IMAGE_MEDIUM_NAME_SUFFIX),
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
   * IDに紐づくイラストを削除する
   * @param data
   */
  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.artRepository.deleteById(data.id);
    // タグ情報を更新する
    await this.tagInfoRepository.aggregateById("arts");
  }

  /**
   * イラストの削除時に実行する
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
      IMAGE_SMALL_MAX_WIDTH,
      IMAGE_SMALL_MAX_WIDTH,
      "inside",
      smallImageName
    );
    await this.storageUtil.makePublic(smallImageName);

    // サムネイル画像（中）を生成する
    const mediumImageName = this.storageUtil.addSuffix(name, IMAGE_MEDIUM_NAME_SUFFIX);
    await this.storageUtil.resizeImageFile(
      object,
      IMAGE_MEDIUM_MAX_WIDTH,
      IMAGE_MEDIUM_MAX_WIDTH,
      "inside",
      mediumImageName
    );
    await this.storageUtil.makePublic(mediumImageName);
  }
}
