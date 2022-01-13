import * as admin from "firebase-admin";
import { Bucket } from "@google-cloud/storage";
import * as functions from "firebase-functions";
import * as sharp from "sharp";

/**
 * ストレージのユーティリティ
 */
export default class StorageUtil {
  private static readonly PUBLIC_URL_BASE: string = "https://storage.googleapis.com";

  protected bucket: Bucket;

  constructor() {
    this.bucket = admin.storage().bucket();
  }

  /**
   * ファイルが存在するかを判定する
   */
  public async exists(name: string) {
    return (await this.bucket.file(name).exists())[0];
  }

  /**
   * ファイルの公開URLを取得する
   * @param name
   */
  public getPublicUrl(name: string) {
    return `${StorageUtil.PUBLIC_URL_BASE}/${this.bucket.name}/${name}`;
  }

  /**
   * ファイルを一般公開する
   */
  public async makePublic(name: string) {
    await this.bucket.file(name).makePublic();
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
   * ファイルの認証済みURLを取得する
   */
  public getSignedUrl(name: string) {
    const file = this.bucket.file(name);
    return new Promise<string>((resolve, reject) => {
      file.getSignedUrl({ action: "read", expires: StorageUtil.getExpiredDate() }, (error, url) =>
        url ? resolve(url) : reject()
      );
    });
  }

  /**
   * ストレージからファイルを削除する
   */
  public async deleteFile(name: string) {
    await this.bucket.file(name).delete();
  }

  /**
   * ストレージからディレクトリとその配下のファイルを全て削除する
   */
  public async deleteFiles(directory: string) {
    await this.bucket.deleteFiles({ directory });
  }

  /**
   * 画像ファイルかを判定する
   */
  public isImageFile(object: functions.storage.ObjectMetadata): boolean {
    const name = object.name!;
    const contentType = object.contentType;
    if (!contentType?.startsWith("image/")) {
      console.warn(`"${name}" is not an image.`);
      return false;
    }
    return true;
  }

  /**
   * ファイル名にサフィックス（接尾辞）を追加する
   */
  public addSuffix(name: string, suffix: string): string {
    const index: number = name.lastIndexOf(".");
    return name.slice(0, index) + suffix + name.slice(index);
  }

  /**
   * 画像ファイルのリサイズが必要かを判定する
   */
  public async needToResizeImageFile(
    object: functions.storage.ObjectMetadata,
    destinationWidth: number,
    destinationHeight: number,
    fit: "inside" | "cover" = "inside"
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const name = object.name!;
      const bucket = admin.storage().bucket(object.bucket);
      const pipeline = sharp();
      pipeline
        .metadata()
        .then((data) => {
          let resized = false;
          const width = data.width;
          const height = data.height;
          if (!width || !height) {
            resolve(false);
            return;
          }
          switch (fit) {
            case "inside":
              if (width <= destinationWidth && height <= destinationHeight) {
                resized = true;
              }
              break;
            case "cover":
              if (width === destinationWidth && height === destinationHeight) {
                resized = true;
              }
              break;
          }
          if (resized) {
            console.log(`"${name}" has not need to resize.`);
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch(reject);
      bucket.file(name).createReadStream().pipe(pipeline);
    });
  }

  /**
   * 画像ファイルをリサイズする
   */
  public resizeImageFile(
    object: functions.storage.ObjectMetadata,
    destinationWidth: number,
    destinationHeight: number,
    fit: "inside" | "cover" = "inside",
    destinationName?: string
  ) {
    return new Promise<void>((resolve, reject) => {
      const name = object.name!;
      const bucket = admin.storage().bucket(object.bucket);
      const stream = bucket.file(destinationName || name).createWriteStream({
        metadata: {
          contentType: object.contentType,
        },
      });
      const pipeline = sharp();
      pipeline
        .resize({
          width: destinationWidth,
          height: destinationHeight,
          fit,
        })
        .pipe(stream);
      bucket.file(name).createReadStream().pipe(pipeline);
      stream
        .on("finish", () => {
          console.log(`"${name}" resized${destinationName ? ` and saved as ${destinationName}` : ""}.`);
          resolve();
        })
        .on("error", reject);
    });
  }
}
