from flask import Blueprint, request, jsonify
top_images = Blueprint('top_images', __name__)


@top_images.route('')
def index():
    data = [{
        "description":
            "test",
        "imageUrl":
            "https://pbs.twimg.com/media/EPGJuZFUEAAJDVK?format=jpg&name=large",
        "thumbnailImageUrl":
            "https://pbs.twimg.com/profile_images/1221035283619037184/nYXhsAoU_mini.jpg"
    }, {
        "description":
            "test2",
        "imageUrl":
            "https://pbs.twimg.com/media/EPtXS7YUYAAez9K?format=jpg&name=large",
        "thumbnailImageUrl":
            "https://pbs.twimg.com/profile_images/1222697781774573568/0yi1pzcD_mini.jpg"
    }, {
        "description":
            "test3",
        "imageUrl":
            "https://pbs.twimg.com/media/EPsgjZ8UcAAot_V?format=jpg&name=large",
        "thumbnailImageUrl":
            "https://pbs.twimg.com/profile_images/1076080213027483648/9LQV89R7_mini.jpg"
    }]
    return jsonify(data)
