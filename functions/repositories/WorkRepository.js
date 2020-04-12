const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("works")

exports.count = async () => {
  const snapshot = await collectionRef.get()
  return snapshot.size
}

/**
 * 作品一覧を取得する
 */
exports.get = async ({ offset = 0, limit }) => {
  // 作成日時の降順で取得する
  const snapshot = await collectionRef.orderBy("createdAt", "desc").get()
  let result = await Promise.all(
    snapshot.docs.map(async document => await snapshotToResult(document))
  )
  if (!limit) {
    return result.slice(offset)
  } else {
    return result.slice(offset, offset + limit)
  }
}

exports.getById = async id => {
  const snapshot = await collectionRef.doc(id).get()
  if (!snapshot.exists) {
    return
  }
  return await snapshotToResult(snapshot)
}

const snapshotToResult = async snapshot => {
  const data = snapshot.data()
  return {
    id: snapshot.id,
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
}
