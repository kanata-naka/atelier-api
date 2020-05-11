import * as admin from "firebase-admin";
import { Bucket } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import * as sharp from "sharp";

/**
 * ストレージのユーティリティ
 */
export default class StorageUtil {
  protected bucket: Bucket;

  constructor() {
    this.bucket = admin.storage().bucket();
  }

  /**
   * ファイルのURLの有効期限を取得する
   */
  private static getExpiredDate() {
    // 現在日の1日後とする
    const result = new Date();
    result.setDate(result.getDate() + 1);
    return result;
  }

  /**
   * ファイルのURLを取得する
   * @param name ストレージ上のパス
   */
  public getFileUrl(name: string) {
    const file = this.bucket.file(name);
    return new Promise<string>((resolve) => {
      file.getSignedUrl(
        { action: "read", expires: StorageUtil.getExpiredDate() },
        (error, url) => {
          resolve(url);
        }
      );
    });
  }

  /**
   * ストレージからディレクトリとその配下のファイルを全て削除する
   * @param directory ディレクトリ名
   */
  public async deleteFiles(directory: string) {
    await this.bucket.deleteFiles({ directory });
  }

  /**
   * 画像ファイルをリサイズする
   * @param object
   * @param maxWidth
   * @param maxHeight
   */
  public resizeImageFile(
    object: functions.storage.ObjectMetadata,
    name: string,
    maxWidth: number,
    maxHeight: number
  ) {
    const contentType = object.contentType;
    if (!contentType?.startsWith("image/")) {
      console.warn(`"${name}" is not an image.`);
      return null;
    }
    const bucket = admin.storage().bucket(object.bucket);
    const metadata = {
      contentType: contentType,
    };
    const stream = bucket.file(name).createWriteStream({ metadata });
    const pipeline = sharp();
    pipeline
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
      })
      .pipe(stream);
    bucket.file(name).createReadStream().pipe(pipeline);
    return new Promise((resolve, reject) =>
      stream.on("finish", resolve).on("error", reject)
    );
  }
}
