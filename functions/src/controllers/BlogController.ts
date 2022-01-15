import { injectable } from "tsyringe";
import BlogGetArticleListResponse from "../dto/BlogGetArticleListResponse";
import AbstractController from "./AbstractController";
import BlogRepository from "../repositories/BlogRepository";
import BlogGetArticleListData from "../dto/BlogGetArticleListData";

/**
 * ブログのコントローラ
 */
@injectable()
export default class BlogController extends AbstractController {
  constructor(private blogRepository: BlogRepository) {
    super();
  }

  /**
   * 記事の一覧を取得する
   * @param data
   */
  public async getArticles(data: BlogGetArticleListData): Promise<BlogGetArticleListResponse> {
    const items = await this.blogRepository.getArticles();
    let result = items!.map((item) => {
      // 最初の画像
      const topImage = item.mediaThumbnail
        ? {
            url: item.mediaThumbnail,
          }
        : undefined;
      return {
        url: item.link!,
        title: item.title!,
        createdAt: item.isoDate!,
        topImage,
      };
    });
    if (data.limit) {
      // 条件：一度に取得する最大件数
      result = result.slice(0, data.limit);
    }
    return {
      result,
    };
  }
}
