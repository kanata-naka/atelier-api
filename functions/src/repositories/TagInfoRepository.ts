import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import AbstractRepository from "./AbstractRepository";
import { Restrict } from "../constants";
import TagInfoModel from "../models/TagInfoModel";

export default class TagInfoRepository extends AbstractRepository<TagInfoModel> {
  constructor() {
    super(["tagInfo"]);
  }

  public async aggregateById(id: string) {
    // 全件取得してタグを集計する
    const snapshot = await admin
      .firestore()
      .collection(id)
      .orderBy("createdAt", "desc")
      .where("restrict", "!=", Restrict.PRIVATE)
      .select("tags")
      .get();
    const info: TagInfoModel.TagInfo[] = [];
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
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
