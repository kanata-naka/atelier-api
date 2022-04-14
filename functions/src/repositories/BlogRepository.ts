import * as rssParser from "rss-parser";
import { BLOG_RSS_URL } from "../constants/blog";

/**
 * ブログのリポジトリ
 */
export default class BlogRepository {
  protected parser: rssParser;

  constructor() {
    this.parser = new rssParser({
      customFields: {
        item: [["media:thumbnail", "mediaThumbnail"]],
      },
    });
  }

  /**
   * 記事の一覧を取得する
   * @param condition 条件
   */
  public async getArticles() {
    const optout = await this.parser.parseURL(BLOG_RSS_URL);
    return optout.items;
  }
}
