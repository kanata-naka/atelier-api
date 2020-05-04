import * as config from "config";
import * as admin from "firebase-admin";

if (!process.argv.length) {
  throw new Error("Argument is required.");
}
const id: string = process.argv[0];

// Firebase Admin SDK を初期化する
admin.initializeApp({
  credential: admin.credential.cert(config.get("firebase.serviceAccount")),
  databaseURL: config.get("firebase.databaseURL"),
  storageBucket: config.get("firebase.storageBucket"),
});

(async () => {
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
  await admin.firestore().collection("tagInfo").doc(id).set({
    info,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("Process succeed.");
})();
