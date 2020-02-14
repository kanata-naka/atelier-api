const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("topImages")

/**
 * トップ画像の一覧を取得する
 */
exports.get = async () => {
  // 表示順の昇順で取得する
  const collection = await collectionRef.orderBy("order", "asc").get()
  let result = await Promise.all(
    collection.docs.map(async document => {
      const data = document.data()
      return {
        id: document.id,
        imageUrl: await storage.getFileUrl(data.image.name),
        thumbnailImageUrl: await storage.getFileUrl(data.thumbnailImage.name),
        description: data.description,
        order: data.order,
        createdAt: data.createdAt._seconds,
        updatedAt: data.updatedAt._seconds
      }
    })
  )
  return result
}
