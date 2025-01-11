import * as functions from "firebase-functions";
import { injectable } from "tsyringe";
import AbstractController from "./AbstractController";
import { COMIC_IMAGE_MAX_WIDTH, EPISODE_IMAGE_MAX_WIDTH, PAGE_IMAGE_MAX_WIDTH } from "../constants";
import ComicModel from "../models/ComicModel";
import EpisodeModel from "../models/EpisodeModel";
import PageModel from "../models/PageModel";
import ComicRepository from "../repositories/ComicRepository";
import ComicCreateRequest from "../schemas/ComicCreateRequest";
import ComicGetByEpisodeIdRequest from "../schemas/ComicGetByEpisodeIdRequest";
import ComicGetByIdRequest from "../schemas/ComicGetByIdRequest";
import ComicGetListRequest from "../schemas/ComicGetListRequest";
import ComicGetListResponse from "../schemas/ComicGetListResponse";
import ComicGetResponse from "../schemas/ComicGetResponse";
import ComicUpdateRequest from "../schemas/ComicUpdateRequest";
import DeleteByIdRequest from "../schemas/DeleteByIdRequest";
import EpisodeCreateRequest from "../schemas/EpisodeCreateRequest";
import EpisodeDeleteRequest from "../schemas/EpisodeDeleteRequest";
import EpisodeUpdateRequest from "../schemas/EpisodeUpdateRequest";
import PageCreateRequest from "../schemas/PageCreateRequest";
import PageDeleteRequest from "../schemas/PageDeleteRequest";
import PageUpdateRequest from "../schemas/PageUpdateRequest";
import StorageService from "../services/StorageService";

@injectable()
export default class ComicController extends AbstractController {
  constructor(
    private comicRepository: ComicRepository,
    private storageService: StorageService,
  ) {
    super();
  }

  public async get(data: ComicGetListRequest): Promise<ComicGetListResponse> {
    const models: Array<ComicModel> = await this.comicRepository.get(data);
    // 最新話のみ取得する
    await Promise.all(
      models.map(async (model) => {
        const latestEpisode = await this.comicRepository.getEpisodeRepository(model.id!).getLatest();
        if (latestEpisode) {
          model.episodes = [latestEpisode];
        }
      }),
    );
    return {
      result: await Promise.all(models.map(async (model) => await this.createComicGetResponse(model))),
    };
  }

  public async getById(data: ComicGetByIdRequest): Promise<ComicGetResponse> {
    const model: ComicModel = await this.comicRepository.getById(data.id);
    model.episodes = await this.comicRepository.getEpisodeRepository(data.id).get(data);
    return await this.createComicGetResponse(model);
  }

  public async getByEpisodeId(data: ComicGetByEpisodeIdRequest): Promise<ComicGetResponse> {
    const model: ComicModel = await this.comicRepository.getById(data.id);
    const episodeRepository = this.comicRepository.getEpisodeRepository(data.id);
    model.episodes = [await episodeRepository.getById(data.episodeId)];
    model.episodes[0].pages = await episodeRepository.getPageRepository(data.episodeId).get();
    return await this.createComicGetResponse(model);
  }

  private async createComicGetResponse(model: ComicModel): Promise<ComicGetResponse> {
    return {
      id: model.id!,
      title: model.title,
      image: model.image && {
        name: model.image.name,
        url: this.storageService.getPublicUrl(model.image.name),
      },
      description: model.description,
      type: model.type,
      completed: model.completed,
      restrict: model.restrict,
      episodes:
        model.episodes?.map((episode) => {
          return {
            id: episode.id!,
            no: episode.no,
            title: episode.title,
            image: episode.image && {
              name: episode.image.name,
              url: this.storageService.getPublicUrl(episode.image.name),
            },
            description: episode.description,
            restrict: episode.restrict,
            pages:
              episode.pages?.map((page) => {
                return {
                  id: page.id!,
                  no: page.no,
                  image: {
                    name: page.image.name,
                    url: this.storageService.getPublicUrl(page.image.name),
                  },
                  createdAt: page.createdAt!.seconds,
                  updatedAt: page.updatedAt!.seconds,
                };
              }) || null,
            createdAt: episode.createdAt!.seconds,
            updatedAt: episode.updatedAt!.seconds,
          };
        }) || null,
      createdAt: model.createdAt!.seconds,
      updatedAt: model.updatedAt!.seconds,
    };
  }

  public async create(data: ComicCreateRequest): Promise<void> {
    const model: ComicModel = {
      ...data,
      createdAt: data.createdAt ? this.comicRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.comicRepository.create(model);
  }

  public async createEpisode(data: EpisodeCreateRequest): Promise<void> {
    const model: EpisodeModel = {
      ...data,
      createdAt: data.createdAt ? this.comicRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.comicRepository.getEpisodeRepository(data.comicId).create(model);
  }

  public async createPage(data: PageCreateRequest): Promise<void> {
    const model: PageModel = {
      ...data,
    };
    await this.comicRepository.getEpisodeRepository(data.comicId).getPageRepository(data.episodeId).create(model);
  }

  public async update(data: ComicUpdateRequest): Promise<void> {
    const model: ComicModel = {
      ...data,
      createdAt: data.createdAt ? this.comicRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.comicRepository.update(model);
  }

  public async updateEpisode(data: EpisodeUpdateRequest): Promise<void> {
    const model: EpisodeModel = {
      ...data,
      createdAt: data.createdAt ? this.comicRepository.createTimestamp(data.createdAt) : undefined,
    };
    await this.comicRepository.getEpisodeRepository(data.comicId).update(model);
  }

  public async updatePage(data: PageUpdateRequest): Promise<void> {
    const model: PageModel = {
      ...data,
    };
    await this.comicRepository.getEpisodeRepository(data.comicId).getPageRepository(data.episodeId).update(model);
  }

  public async onUpdate(change: functions.Change<functions.firestore.DocumentSnapshot>): Promise<void> {
    const before = change.before.data() as ComicModel | EpisodeModel | PageModel;
    const after = change.after.data() as ComicModel | EpisodeModel | PageModel;

    // 古い画像を削除する
    if (before.image && before.image.name !== after.image?.name) {
      const name = before.image.name;
      await this.storageService
        .deleteFile(name)
        .then(() => console.log(`"${name}" deleted.`))
        .catch(() => console.error(`"${name}" failed to delete.`));
    }
  }

  public async deleteById(data: DeleteByIdRequest): Promise<void> {
    await this.comicRepository.deleteById(data.id);
  }

  public async deleteEpisode(data: EpisodeDeleteRequest): Promise<void> {
    await this.comicRepository.getEpisodeRepository(data.comicId).deleteById(data.id);
  }

  public async deletePage(data: PageDeleteRequest): Promise<void> {
    await this.comicRepository.getEpisodeRepository(data.comicId).getPageRepository(data.episodeId).deleteById(data.id);
  }

  public async onDelete(snapshot: functions.firestore.DocumentSnapshot): Promise<void> {
    await this.storageService.deleteFiles(snapshot.ref.path);
    console.log(`"comics/${snapshot.id}" deleted.`);
  }

  public async onUploadImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    await this._onUploadImageFile(object, COMIC_IMAGE_MAX_WIDTH);
  }

  public async onUploadEpisodeImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    await this._onUploadImageFile(object, EPISODE_IMAGE_MAX_WIDTH);
  }

  public async onUploadPageImageFile(object: functions.storage.ObjectMetadata): Promise<void> {
    await this._onUploadImageFile(object, PAGE_IMAGE_MAX_WIDTH);
  }

  private async _onUploadImageFile(object: functions.storage.ObjectMetadata, maxWidth: number): Promise<void> {
    const name = object.name!;

    if (!this.storageService.isImageFile(object)) {
      return;
    }

    // 画像をリサイズする
    if (await this.storageService.needToResizeImageFile(object, maxWidth, maxWidth, "inside")) {
      await this.storageService.resizeImageFile(object, maxWidth, maxWidth, "inside");
      await this.storageService.makePublic(name);
    }
  }
}
