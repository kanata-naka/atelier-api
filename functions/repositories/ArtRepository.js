const admin = require("firebase-admin")
const storage = require("../utils/storage")

const collectionRef = admin.firestore().collection("arts")

const now = async () => {
  return admin.firestore.FieldValue.serverTimestamp()
}

/**
 * 全てのタグとその件数を取得する
 */
exports.getAllTagsInfo = async () => {
  const snapshot = await collectionRef.orderBy("createdAt", "desc")
    .select('tags').get()
  const result = {}
  snapshot.docs.map(document => {
    const tags = [ ...document.data().tags ]
    tags.forEach(tag => {
      if (result[tag]) {
        result[tag]++
      } else {
        result[tag] = 1
      }
    })
  })
  return result
}

/**
 * イラスト一覧を取得する
 */
exports.get = async ({ tag, lastId, limit }) => {
  // 作成日時の降順で取得する
  let query = collectionRef.orderBy("createdAt", "desc")
  if (tag) {
    query = query.where("tags", "array-contains", tag)
  }
  if (lastId) {
    query = query.startAfter(await collectionRef.doc(lastId).get())
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
 * イラストを取得する
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
