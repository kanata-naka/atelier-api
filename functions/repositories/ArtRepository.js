const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("arts")

const now = async () => {
  return admin.firestore.FieldValue.serverTimestamp()
}

/**
 * イラスト一覧を取得する
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
        tags: data.tags,
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

/**
 * イラストを取得する
 * @param id
 */
exports.getById = async id => {
  const document = await collectionRef.doc(id).get()
  if (!document.exists) {
    return
  }
  return {
    id: document.id,
    ...document.data()
  }
}

/**
 * イラストを登録する
 * @param param パラメータ
 */
exports.create = async param => {
  const documentRef = collectionRef.doc(param.id)
  delete param.id
  await documentRef.set({
    ...param,
    createdAt: await now(),
    updatedAt: await now()
  })
  const document = await documentRef.get()
  return {
    id: document.id,
    ...document.data()
  }
}

/**
 * イラストを更新する
 * @param param パラメータ
 */
exports.update = async param => {
  const documentRef = collectionRef.doc(param.id)
  delete param.id
  await documentRef.update({
    ...param,
    updatedAt: await now()
  })
  const document = await documentRef.get()
  return {
    id: document.id,
    ...document.data()
  }
}

/**
 * イラストを削除する
 */
exports.deleteById = async id => {
  await collectionRef.doc(id).delete()
}
