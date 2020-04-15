const functions = require("firebase-functions")
const config = require("config")
const TagInfoRepository = require("../repositories/TagInfoRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * タグ情報を取得する
 */
exports.get = functions
  .region(FIREBASE_REGION)
  .https.onCall(async ({ category }) => {
    try {
      return await TagInfoRepository.getTagInfo(category)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
