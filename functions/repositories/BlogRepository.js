const config = require("config")
const axios = require("axios")

/**
 * 記事一覧を取得する
 */
exports.getArticles = async ({ page, limit }) => {
  const response = await axios({
    method: 'get',
    url: `https://note.com/api/v2/creators/${config.get("note.username")}/contents`,
    params: {
      kind: "note",
      page: page || 1,
      disabled_pinned: false
    }
  })
  let result = response.data.data.contents.map(content => {
    const topImage = content.pictures.length ? {
      url: content.pictures[0].url
    } : undefined
    return {
      id: content.key,
      title: content.name,
      createdAt: content.publishAt,
      topImage
    }
  })
  if (
    result = result.slice(0, limit)
  )
  return result
}
