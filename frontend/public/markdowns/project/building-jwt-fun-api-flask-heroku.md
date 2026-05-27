![](/images/project/building-jwt-fun-api-flask-heroku/fun-api-hero.png)

Apps often need lightweight, fun content — jokes, riddles, proverbs — behind a secure API integrators can call. This project is a **Flask REST API** with JWT auth, role-based access, and Heroku deployment.

## Problem

Exposing content endpoints without auth leads to abuse; a production-style API should offer:

- **Registration and login** with bearer tokens
- **Read endpoints** for general users
- **Admin CRUD** for content management
- **Hosted deployment** for real integration tests

## Solution

**Fun_API** ([GitHub](https://github.com/ayotomiwasalau/Fun_api)) — Flask app with:

- `GET /jokes`, `GET /riddle`, `GET /proverbs` — random content for authenticated users
- `POST /riddle/<id>/answer` — submit riddle answers
- Admin `POST` / `PATCH` / `DELETE` for jokes, riddles, and proverbs
- JWT bearer authentication on all routes

Deployed at [fun-apis.herokuapp.com](https://fun-apis.herokuapp.com/) with `Procfile` for Heroku.

## Architecture breakdown

### Auth

Users register and receive access tokens; requests use `Authorization: Bearer <token>`. Separate **general** and **admin** privileges (see `Test_credentials` and `testconfig.py` in the repo for local testing).

### Content layer

`model.py` and supporting modules store and serve jokes, riddles (with answers), and African proverbs. **NLTK** utilities in `nltkref.py` support text handling where needed.

### API surface

Designed for **curl/Postman** integration — clear GET/POST/PATCH/DELETE semantics per resource type.

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, Flask |
| Auth | JWT bearer tokens |
| NLP | NLTK |
| Deploy | Heroku, Gunicorn (via Procfile) |
| Testing | test.py, testconfig.py |

## Example usage

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" https://fun-apis.herokuapp.com/jokes
curl -H "Authorization: Bearer <ACCESS_TOKEN>" https://fun-apis.herokuapp.com/riddle
```

## Links

- [GitHub — Fun_api](https://github.com/ayotomiwasalau/Fun_api)
- [Live API — fun-apis.herokuapp.com](https://fun-apis.herokuapp.com/)
