from flask import Blueprint, request, jsonify
arts = Blueprint('arts', __name__)


@arts.route('/')
def index():
    data = [{
        "title":
            "羊肉ブーム....................？？？？？？？？？？",
        "createdAt":
            1580823569,
        "id":
            6,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EOoKFQXUUAEAYQd?format=jpg&name=large"
        }, {
            "url":
                "https://pbs.twimg.com/media/EPxk6DZU8AECdls?format=jpg&name=large"
        }, {
            "url":
                "https://pbs.twimg.com/media/EP7-A_hUUAAEah6?format=jpg&name=large"
        }],
        "description":
            "🎨2月5日～のパレプロEXスケジュールです🎨\n\nメンバーの配信曜日が変わってるのでご確認くださいませ！\n\n※暁月クララは都合によりお休みです🙇‍♀️\n振替日は追ってご連絡いたします🍮"
    }, {
        "title":
            "やっぱり猫やんけ！",
        "createdAt":
            1580823569,
        "id":
            5,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EP7tZYOU4AA3SJn?format=jpg&name=large"
        }],
        "description":
            "🏮【緊急事態】私たち、入れ替わってる！？愛の力で元に戻れ！！【白上フブキ/夏色まつり】\n🏮2月5日21:00〜\n\n1-2-Switchをやって負けたら罰ゲーム！\n\n待機場所\nyoutube.com/watch?v=TdVzrW…\n\nリスナーさんを満足させたらもとに戻れるんですか・・・？"
    }, {
        "title":
            "めっかわいい",
        "createdAt":
            1580823569,
        "id":
            4,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EOpCuukU8AU_gXq?format=jpg&name=large"
        }],
        "description":
            "畑できた！！！！！！！！\nあとは生えるのを待つだけ...！！！\n野菜大切！！！！！！！！\n楽しかった！！！！！！！！！\nまた次回の紫咲シオン、\nARK配信にご期待ください。"
    }, {
        "title": "忘れろビーーーーーーーーム🍬🍬🍬",
        "createdAt": 1580823569,
        "id": 3,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EOCwK6GVAAEPYB2?format=jpg&name=large"
        }],
        "description": "UNOでみんなで遊んでる"
    }, {
        "title": "やった～💓！はじめるじょ！",
        "createdAt": 1580823569,
        "id": 2,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EN3FWw0VUAAxvU7?format=jpg&name=large"
        }],
        "description": "いつか 素顔を見せる日がきたら そのときは笑顔でいたい♪の璃奈ちゃんの笑顔で全俺が泣いた😂"
    }, {
        "title": "大事なお知らせがある！！！！！！！２３時から！！！！！",
        "createdAt": 1580823569,
        "id": 1,
        "images": [{
            "url":
                "https://pbs.twimg.com/media/EN7QRNAVUAAy7RX?format=jpg&name=large"
        }],
        "description": "アニメやゲームに出てきそうな現在風忍者をイメージしました！ #ぽこピー新衣装"
    }]
    return jsonify(data)
