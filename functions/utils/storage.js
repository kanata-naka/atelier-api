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

/**
 * ストレージにファイルを保存する
 * @param file 保存するファイル
}* @param name ファイル名
 */
exports.saveFile = async (file, name) => {
  const _file = bucket.file(name)
  await _file.save(file.buffer)
  await _file.setMetadata({ contentType: file.mimetype })
}

/**
 * ストレージからファイルを削除する
}* @param name ファイル名
 */
exports.deleteFile = async name => {
  const file = bucket.file(name)
  await file.delete()
}

/**
 * ストレージからディレクトリとその配下のファイルを全て削除する
 * @param directory ディレクトリ名
 */
exports.deleteFiles = async directory => {
  await bucket.deleteFiles({ directory: directory })
}
