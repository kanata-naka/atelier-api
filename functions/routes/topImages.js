const functions = require("firebase-functions")
const config = require("config")
const TopImageRepository = require("../repositories/TopImageRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * トップ画像の一覧を取得する
 */
exports.get = functions
  .region(FIREBASE_REGION)
  .https.onCall(async () => {
    try {
      return await TopImageRepository.get()
    } catch (error) {
      console.error(error)
      throw error
    }
  })
