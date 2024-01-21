import { Bucket } from "@google-cloud/storage";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as sharp from "sharp";

export default class StorageService {
  protected bucket: Bucket;

  constructor() {
    this.bucket = admin.storage().bucket();
  }

  public async exists(name: string) {
    return (await this.bucket.file(name).exists())[0];
  }

  public getPublicUrl(name: string) {
    return `https://storage.googleapis.com/${this.bucket.name}/${name}`;
  }

  public async makePublic(name: string) {
    await this.bucket.file(name).makePublic();
  }

  public async deleteFile(name: string) {
    await this.bucket.file(name).delete();
  }

  public async deleteFiles(prefix: string) {
    await this.bucket.deleteFiles({ prefix });
  }

  public isImageFile(object: functions.storage.ObjectMetadata): boolean {
    const name = object.name!;
    const contentType = object.contentType;
    if (!contentType?.startsWith("image/")) {
      console.warn(`"${name}" is not an image.`);
      return false;
    }
    return true;
  }

  public addSuffix(name: string, suffix: string): string {
    const index: number = name.lastIndexOf(".");
    return name.slice(0, index) + suffix + name.slice(index);
  }

  public async needToResizeImageFile(
    object: functions.storage.ObjectMetadata,
    destinationWidth: number,
    destinationHeight: number,
    fit: "inside" | "cover" = "inside",
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

  public resizeImageFile(
    object: functions.storage.ObjectMetadata,
    destinationWidth: number,
    destinationHeight: number,
    fit: "inside" | "cover" = "inside",
    destinationName?: string,
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
