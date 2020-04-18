const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("works")

/**
 * 作品一覧を取得する
 */
exports.get = async ({ limit, pickupFlag }) => {
  // 作成日時の降順で取得する
  let query = collectionRef.orderBy("createdAt", "desc")
  if (pickupFlag) {
    query = query.where("pickupFlag", "==", true)
  }
  if (limit) {
    query = query.limit(limit)
  }
  const snapshot = await query.get()
  let result = await Promise.all(
    snapshot.docs.map(async document => await snapshotToResult(document))
  )
  return result
}

/**
 * 作品を取得する
 * @param id
 */
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
