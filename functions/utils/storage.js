const admin = require("firebase-admin")

const bucket = admin.storage().bucket()

/**
 * ファイルのURLを取得する
 * @param name ファイル名
 */
exports.getFileUrl = name => {
  const file = bucket.file(name)
  return new Promise(resolve => {
    file.getSignedUrl(
      { action: "read", expires: "12-31-2020" },
      (error, url) => {
        resolve(url)
      }
    )
  })
}
