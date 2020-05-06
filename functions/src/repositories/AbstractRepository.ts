import * as admin from "firebase-admin";
import * as uuidv4 from "uuid/v4";
import AbstractModel from "../models/AbstractModel";

/**
 * リポジトリの基底クラス
 */
export default abstract class AbstractRepository<T extends AbstractModel> {
  protected collectionRef: FirebaseFirestore.CollectionReference;

  constructor(collectionPath: string) {
    this.collectionRef = admin.firestore().collection(collectionPath);
  }

  /**
   * id に紐づくドキュメントを取得する
   * なければエラーを返す
   * @param id
   */
  public async getById(id: string): Promise<T> {
    const snapshot = await this.collectionRef.doc(id).get();
    if (!snapshot.exists) {
      throw new Error(`Document not found. id=[${id}]`);
    }
    const result = snapshot.data() as T;
    result.id = snapshot.id;
    return result;
  }

  /**
   * ドキュメントを作成する
   * @param model
   */
  public async create(model: T) {
    const documentRef = this.collectionRef.doc(model.id || uuidv4());
    delete model.id;
    await documentRef.set({
      createdAt: this.now,
      updatedAt: this.now,
      ...model,
    });
  }

  /**
   * ドキュメントを更新する
   * @param model
   */
  public async update(model: T) {
    const documentRef = this.collectionRef.doc(model.id!);
    delete model.id;
    await documentRef.update({
      updatedAt: this.now,
      ...model,
    });
  }

  /**
   * ドキュメントを一括で更新する
   * @param models
   */
  public async bulkUpdate(models: Array<T>) {
    let batch = admin.firestore().batch();
    const snapshot = await this.collectionRef.get();
    let count = 0;
    await Promise.all(
      snapshot.docs.map(async (documentSnapshot, index) => {
        const model = models.find(
          (_model) => documentSnapshot.id === _model.id
        );
        if (!model) {
          return;
        }
        delete model.id;
        if (count === 500) {
          // 500件ごとにcommitしてbatchインスタンスを初期化する
          await batch.commit();
          batch = admin.firestore().batch();
          count = 0;
        }
        batch.update(documentSnapshot.ref, {
          updatedAt: this.now,
          ...model,
        });
        count++;
      })
    );
    await batch.commit();
  }

  /**
   * id に紐づくドキュメントを削除する
   * @param id
   */
  public async deleteById(id: string) {
    await this.collectionRef.doc(id).delete();
  }

  /**
   * ドキュメントを一括で削除する
   * @param ids
   */
  public async bulkDelete(ids: Array<string>) {
    let batch = admin.firestore().batch();
    const snapshot = await this.collectionRef.get();
    let count = 0;
    await Promise.all(
      snapshot.docs.map(async (documentSnapshot, index) => {
        if (!ids.find((id) => documentSnapshot.id === id)) {
          return;
        }
        if (count === 500) {
          // 500件ごとにcommitしてbatchインスタンスを初期化する
          await batch.commit();
          batch = admin.firestore().batch();
          count = 0;
        }
        batch.delete(documentSnapshot.ref);
        count++;
      })
    );
    await batch.commit();
  }

  /**
   * 現在日時を取得する
   */
  protected get now() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * UNIXタイムスタンプ（秒）から@code{Timestamp}オブジェクトを生成する
   * @param seconds
   */
  public createTimestamp(seconds: number) {
    return admin.firestore.Timestamp.fromMillis(seconds * 1000);
  }
}
