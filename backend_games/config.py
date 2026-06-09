from flask import Flask

app = Flask(__name__)
# Accept /path and /path/ without redirecting (avoids wrong Host behind CloudFront).
app.url_map.strict_slashes = False
