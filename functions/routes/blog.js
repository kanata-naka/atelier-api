const functions = require("firebase-functions")
const config = require("config")
const BlogRepository = require("../repositories/BlogRepository")

// リージョン
const FIREBASE_REGION = config.get("firebase.region")

/**
 * 記事一覧を取得する
 */
exports.getArticles = functions.region(FIREBASE_REGION).https.onCall(async data => {
  try {
    const result = await BlogRepository.getArticles(data)
    return {
      result
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})
