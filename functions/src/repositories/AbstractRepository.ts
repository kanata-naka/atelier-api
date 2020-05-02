import * as admin from "firebase-admin";
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
   * 現在日時を取得する
   */
  protected get now() {
    return admin.firestore.FieldValue.serverTimestamp();
  }
}
