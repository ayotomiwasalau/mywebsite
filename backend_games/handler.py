from apig_wsgi import make_lambda_handler

from backend_games.app import app

handler = make_lambda_handler(app)
