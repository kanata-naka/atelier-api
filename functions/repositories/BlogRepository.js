const config = require("config")
const rssParser = require("rss-parser")
const parser = new rssParser({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
    ]
  }
})

/**
 * 記事一覧を取得する
 */
exports.getArticles = async ({ page, limit }) => {
  const feed = await parser.parseURL(`https://note.com/${config.get("note.username")}/rss`)
  let result = feed.items.map(item => {
    const topImage = item.mediaThumbnail ? {
      url: item.mediaThumbnail
    } : undefined
    return {
      url: item.link,
      title: item.title,
      createdAt: item.isoDate,
      topImage
    }
  })
  if (
    result = result.slice(0, limit)
  )
  return result
}
