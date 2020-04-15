const admin = require("firebase-admin")

const collectionRef = admin.firestore().collection("tagInfo")

const now = async () => {
  return admin.firestore.FieldValue.serverTimestamp()
}

const acceptableCategories = ["arts"]

/**
 * タグ情報を取得する
 */
exports.getTagInfo = async category => {
  if (!acceptableCategories.includes(category)) {
    throw new Error()
  }
  const snapshot = await collectionRef.doc(category).get()
  if (!snapshot.exists) {
    return {
      info: {}
    }
  }
  const data = snapshot.data()
  return {
    info: data.info,
    updatedAt: data.updatedAt._seconds
  }
}

/**
 * タグを集計してタグ情報に登録する
 */
exports.aggregateTagInfo = async category => {
  if (!acceptableCategories.includes(category)) {
    throw new Error()
  }
  // 全件取得してタグを集計する
  const snapshot = await admin
    .firestore()
    .collection(category)
    .orderBy("createdAt", "desc")
    .select("tags")
    .get()
  const result = {}
  snapshot.docs.map(document => {
    const tags = [...document.data().tags]
    tags.forEach(tag => {
      if (result[tag]) {
        result[tag]++
      } else {
        result[tag] = 1
      }
    })
  })
  // タグ情報に登録する
  await collectionRef.doc(category).set({
    info: result,
    updatedAt: await now()
  })
}
