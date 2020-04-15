const admin = require("firebase-admin")
const config = require("config")

// Firebase Admin SDK を初期化する
admin.initializeApp({
  credential: admin.credential.cert(config.get("firebase.serviceAccount")),
  databaseURL: config.get("firebase.databaseURL"),
  storageBucket: config.get("firebase.storageBucket")
})

// api
exports.api = {
  topImages: require("./routes/topImages"),
  // blog: require("./routes/blog"),
  tagInfo: require("./routes/tagInfo"),
  works: require("./routes/works"),
  arts: require("./routes/arts")
}
