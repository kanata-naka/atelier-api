from flask import Blueprint, request, jsonify
articles = Blueprint('articles', __name__)

@articles.route('/')
def index():
    data = [
      {
        "title":
          "C95お品書きああああああああああああああああああああああああああ",
        "createdAt": 1580823569,
        "id": 3,
        "topImageUrl":
          "https://pbs.twimg.com/media/EP1xJQdVAAEHViq?format=jpg&name=large"
      },
      {
        "title":
          "C95お品書きああああああああああああああああああああああああああ",
        "createdAt": 1580823569,
        "id": 2,
        "topImageUrl": None
      },
      {
        "title":
          "C95お品書きああああああああああああああああああああああああああ",
        "createdAt": 1580823569,
        "id": 1,
        "topImageUrl":
          "https://pbs.twimg.com/media/EP1xJQdVAAEHViq?format=jpg&name=large"
      }
    ]
    return jsonify(data)
