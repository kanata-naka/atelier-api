from flask import Flask
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config["JSON_SORT_KEYS"] = False

from controllers.top_images import top_images
app.register_blueprint(top_images, url_prefix='/top_images')

from controllers.articles import articles
app.register_blueprint(articles, url_prefix='/articles')

from controllers.works import works
app.register_blueprint(works, url_prefix='/works')

from controllers.arts import arts
app.register_blueprint(arts, url_prefix='/arts')

if __name__ == "__main__":
    app.debug = True
    app.run(host='localhost', port=8000)
