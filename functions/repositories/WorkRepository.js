const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("works")

/**
 * 作品一覧を取得する
 */
exports.get = async () => {
  // 作成日時の降順で取得する
  const collection = await collectionRef.orderBy("createdAt", "desc").get()
  let result = await Promise.all(
    collection.docs.map(async document => {
      const data = document.data()
      return {
        id: document.id,
        title: data.title,
        images: await Promise.all(
          data.images.map(async image => {
            return {
              ...image,
              url: await storage.getFileUrl(image.name)
            }
          })
        ),
        description: data.description,
        createdAt: data.createdAt._seconds,
        updatedAt: data.updatedAt._seconds
      }
    })
  )
  return result
}
