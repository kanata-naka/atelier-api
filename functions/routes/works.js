const functions = require("firebase-functions")
const config = require("config")
const WorkRepository = require("../repositories/WorkRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * 作品一覧を取得する
 */
exports.get = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    return {
      result: await WorkRepository.get(data)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * 作品を取得する
 */
exports.getById = functions
  .region(FIREBASE_REGION)
  .https.onCall(async ({ id }) => {
    try {
      return await WorkRepository.getById(id)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
