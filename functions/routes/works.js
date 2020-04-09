const functions = require("firebase-functions")
const config = require("config")
const WorkRepository = require("../repositories/WorkRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * 作品一覧を取得する
 */
exports.get = functions.region(FIREBASE_REGION).https.onCall(async () => {
  try {
    return await WorkRepository.get()
  } catch (error) {
    console.error(error)
    throw error
  }
})
