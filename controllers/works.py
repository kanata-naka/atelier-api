from flask import Blueprint, request, jsonify
works = Blueprint('works', __name__)


@works.route('/')
def index():
    data = [{
        "title":
            "Superstars! mini1+2",
        "id":
            6,
        "createdAt":
            1580823569,
        "description":
            "jQuery UI 1.9 で .disableSelection() はdeprecated(非推奨)になっている1。\n\nだから、CSSで代替する2(か、そもそもweb画面上のものを選択不可にしたりするのを止めるかした)方がいい。\n\n* {\n   -ms-user-select: none; /* IE 10+ */\n   -moz-user-select: -moz-none;\n   -khtml-user-select: none;\n   -webkit-user-select: none;\n   user-select: none;\n}\n\n.selectable {\n   -ms-user-select: auto;\n   -moz-user-select: auto;\n   -khtml-user-select: auto;\n   -webkit-user-select: auto;\n   user-select: auto;\n}\nこのCSS要素はOpera Mini 以外の主要ブラウザでサポートされているとのこと3。",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EMcTvtrUUAAKCN4?format=jpg&name=large"
        }]
    }, {
        "title":
            "Superstars! mini2",
        "id":
            5,
        "createdAt":
            1580823569,
        "description":
            "テキストを選択されないように指定しているサイトがあります。モバイルのサイトでよく見かける気がします(^^ゞ\n\nテキストを選択させない\nuser-selectを使います。\n\nテキストを選択させないCSS\np {\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\nこれでpタグのテキストは選択されなくなります。\nモバイルでは問題なく動くんですかね−。IEは10以上で対応みたいです(☝ ՞ਊ ՞)",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EBfcFhOVUAAC1jU?format=jpg&name=large"
        }]
    }, {
        "title":
            "Superstars!",
        "id":
            4,
        "createdAt":
            1580823569,
        "description":
            "・宝鐘マリン\n【YouTube】\nhttps://www.youtube.com/channel/UCCzU...\n【Twitter】\nhttps://twitter.com/houshoumarine\n\n【元動画】\n【晩酌雑談】💘キミたちの人生の悩みを解決する女上司。💘【ホロライブ/宝鐘マリン】\nhttps://www.youtube.com/watch?v=pdp-g...\n\n#ホロライブ\n#宝鐘マリン\n#マリン船長\n#切り抜き",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DvOFOTjUYAAgfHL?format=jpg&name=large"
        }]
    }, {
        "title": "歳納京子 大物YouTubeｒになる 完全版",
        "id": 3,
        "createdAt": 1580823569,
        "description": "てｓｔ\nhoge\nfuga",
        "images": None
    }, {
        "title":
            "未完",
        "id":
            2,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DR5OZTdUEAAK4BV?format=jpg&name=large"
        }]
    }, {
        "title":
            "【寄稿】Bon Appetit",
        "id":
            1,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DQ0v93fVQAAyFWd?format=jpg&name=large"
        }]
    }, {
        "title":
            "Superstars! mini1+2",
        "id":
            6,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EMcTvtrUUAAKCN4?format=jpg&name=large"
        }]
    }, {
        "title":
            "Superstars! mini2",
        "id":
            5,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EBfcFhOVUAAC1jU?format=jpg&name=large"
        }]
    }, {
        "title":
            "Superstars!",
        "id":
            4,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DvOFOTjUYAAgfHL?format=jpg&name=large"
        }]
    }, {
        "title": "歳納京子 大物YouTubeｒになる 完全版",
        "id": 3,
        "createdAt": 1580823569,
        "description": "てｓｔ\nhoge\nfuga",
        "images": None
    }, {
        "title":
            "未完",
        "id":
            2,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DR5OZTdUEAAK4BV?format=jpg&name=large"
        }]
    }, {
        "title":
            "【寄稿】Bon Appetit",
        "id":
            1,
        "createdAt":
            1580823569,
        "description":
            "てｓｔ\nhoge\nfuga",
        "images": [{
            "url":
                "https://pbs.twimg.com/media/DQ0v93fVQAAyFWd?format=jpg&name=large"
        }]
    }]
    max = request.args.get('max', len(data), type=int)
    return jsonify(data[0:max])
