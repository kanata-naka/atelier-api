import * as admin from "firebase-admin";
import { uuid } from "uuidv4";
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
   * IDに紐づくドキュメントを取得する
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
  public async create(model: T): Promise<void> {
    const documentRef = this.collectionRef.doc(model.id || uuid());
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
  public async update(model: T): Promise<void> {
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
  public async bulkUpdate(models: Array<T>): Promise<void> {
    let batch = admin.firestore().batch();
    const snapshot = await this.collectionRef.get();
    let count = 0;
    await Promise.all(
      snapshot.docs.map(async (documentSnapshot, index) => {
        const model = models.find((_model) => documentSnapshot.id === _model.id);
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
   * IDに紐づくドキュメントを削除する
   * @param id
   */
  public async deleteById(id: string): Promise<void> {
    await this.collectionRef.doc(id).delete();
  }

  /**
   * ドキュメントを一括で削除する
   * @param ids
   */
  public async bulkDelete(ids: Array<string>): Promise<void> {
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
  // public get now(): FirebaseFirestore.FieldValue {
  //   return admin.firestore.FieldValue.serverTimestamp();
  // }
  public get now(): FirebaseFirestore.Timestamp {
    return admin.firestore.Timestamp.now();
  }

  /**
   * UNIXタイムスタンプ（秒）から {@link FirebaseFirestore.Timestamp} を生成する
   * @param seconds
   */
  public createTimestamp(seconds: number): FirebaseFirestore.Timestamp {
    return admin.firestore.Timestamp.fromMillis(seconds * 1000);
  }
}
