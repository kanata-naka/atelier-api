const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("topImages")

const now = async () => {
  return admin.firestore.FieldValue.serverTimestamp()
}

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
        image: {
          name: data.image.name,
          url: await storage.getFileUrl(data.image.name)
        },
        thumbnailImage: {
          name: data.thumbnailImage.name,
          url: await storage.getFileUrl(data.thumbnailImage.name)
        },
        description: data.description,
        order: data.order,
        createdAt: data.createdAt._seconds,
        updatedAt: data.updatedAt._seconds
      }
    })
  )
  return result
}

/**
 * トップ画像を取得する
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
 * トップ画像を登録する
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
 * トップ画像を更新する
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
 * トップ画像を削除する
 */
exports.deleteById = async id => {
  await collectionRef.doc(id).delete()
}
