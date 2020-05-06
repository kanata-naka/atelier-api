import * as admin from "firebase-admin";
import AbstractRepository from "./AbstractRepository";
import TagInfoModel from "../models/TagInfoModel";

/**
 * タグ情報のリポジトリ
 */
export default class TagInfoRepository extends AbstractRepository<
  TagInfoModel
> {
  constructor() {
    super("tagInfo");
  }

  /**
   * タグ情報を集計する
   * @param id
   */
  public async aggregateById(id: string) {
    // 全件取得してタグを集計する
    const snapshot = await admin
      .firestore()
      .collection(id)
      .orderBy("createdAt", "desc")
      .select("tags")
      .get();
    const info: Array<{
      name: string;
      count: number;
    }> = [];
    snapshot.docs.map((documentSnapshot) => {
      const tagNames: string[] = [...documentSnapshot.data().tags];
      tagNames.forEach((tagName) => {
        const tag = info.find((_tag) => _tag.name === tagName);
        if (tag) {
          tag.count++;
        } else {
          info.push({ name: tagName, count: 1 });
        }
      });
    });
    // タグ情報に登録する
    await this.collectionRef.doc(id).set({
      info,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}