const functions = require("firebase-functions")
const config = require("config")
const storage = require("../utils/storage")
const TopImageRepository = require("../repositories/TopImageRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * トップ画像の一覧を取得する
 */
exports.get = functions.region(FIREBASE_REGION).https.onCall(async () => {
  try {
    return await TopImageRepository.get()
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * トップ画像を登録する
 */
exports.create = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    const param = {
      id: data.id,
      image: {
        name: data.image.name
      },
      thumbnailImage: {
        name: data.thumbnailImage.name
      },
      description: data.description,
      order: data.order
    }
    return await TopImageRepository.create(param)
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * トップ画像を更新する
 */
exports.update = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    for (let topImage of data.topImages) {
      const originalTopImage = await TopImageRepository.getById(topImage.id)
      if (topImage.image.name !== originalTopImage.image.name) {
        // 画像を削除する
        storage.deleteFile(image.name)
        console.log(`Removed image file. ${image.name}`)
      }
      if (
        topImage.thumbnailImage.name !== originalTopImage.thumbnailImage.name
      ) {
        // サムネイル画像を削除する
        storage.deleteFile(thumbnailImage.name)
        console.log(`Removed thumbnailImage file. ${thumbnailImage.name}`)
      }
      const param = {
        id: topImage.id,
        image: {
          name: topImage.image.name
        },
        thumbnailImage: {
          name: topImage.thumbnailImage.name
        },
        description: topImage.description,
        order: data.order
      }
      return await TopImageRepository.update(param)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * トップ画像を削除する
 */
exports.deleteById = functions
  .region(FIREBASE_REGION)
  .https.onCall(async ({ id }) => {
    try {
      storage.deleteFiles(`topImages/${id}`)
      await TopImageRepository.deleteById(id)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
