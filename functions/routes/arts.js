const functions = require("firebase-functions")
const config = require("config")
const storage = require("../utils/storage")
const ArtRepository = require("../repositories/ArtRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * イラスト一覧を取得する
 */
exports.get = functions.region(FIREBASE_REGION).https.onCall(async () => {
  try {
    return await ArtRepository.get()
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * イラストを登録する
 * @param files ファイル一覧
 * @param title タイトル
 * @param tags タグ一覧
 * @param description 説明
 */
exports.create = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    const param = {
      id: data.id,
      title: data.title,
      images: data.images.map(image => {
        return { name: image.name }
      }),
      tags: data.tags,
      description: data.description
    }
    return await ArtRepository.create(param)
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * イラストを更新する
 * @param files ファイル一覧
 * @param title タイトル
 * @param images 画像一覧
 * @param tags タグ一覧
 * @param description 説明
 */
exports.update = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    const images = data.images
    const updatedImages = []
    for (let image of images) {
      if (image.removed) {
        // 画像を削除する
        storage.deleteFile(image.name)
        console.log(`Removed image file. ${image.name}`)
        continue
      }
      updatedImages.push({ name: image.name })
    }
    const param = {
      id: data.id,
      title: data.title,
      images: updatedImages,
      tags: data.tags,
      description: data.description
    }
    return await ArtRepository.update(param)
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * イラストを削除する
 * @param id
 */
exports.deleteById = functions
  .region(FIREBASE_REGION)
  .https.onCall(async id => {
    try {
      storage.deleteFiles(`arts/${id}`)
      await ArtRepository.deleteById(id)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
