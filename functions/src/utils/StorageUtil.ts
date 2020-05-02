import * as admin from "firebase-admin";
import { Bucket } from "@google-cloud/storage";

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
}
