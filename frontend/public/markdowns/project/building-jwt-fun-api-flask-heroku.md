![](/images/project/building-jwt-fun-api-flask-heroku/funapi.png)
This project is a **Flask REST API** on **Heroku** that serves jokes, riddles, and African proverbs to authenticated clients—random content on each GET, admin CRUD for curators, and riddle answers graded on a separate POST route. **Auth0 JWT** bearer tokens gate every endpoint via permission-scoped routes; **PostgreSQL** stores the catalogue—live.

[GitHub — Fun_api](https://github.com/ayotomiwasalau/Fun_api)

## Context

A public jokes API sounds simple until you need to control who reads content, who curates it, and how riddles stay fair. Open endpoints invite scraping; a single shared admin password does not scale. The service had to satisfy four requirements without exposing riddle answers on every GET:

- **Authenticated access** — callers obtain a bearer token before hitting content routes
- **Read APIs** for general users — random jokes, riddles, and proverbs per request
- **Admin CRUD** — create, update, and delete jokes, riddles, and proverbs
- **Hosted URL** — live Heroku instance for curl, Postman, and integration demos

## Approach

**Fun_API** wires Flask routes to SQLAlchemy models, each protected by a `@requires_auth('<permission>')` decorator that validates an Auth0 JWT and checks a permission claim before the handler runs. Random content uses `order_by(func.random())`; riddles keep answers off the GET payload and grade submissions on a separate POST route.

| Role | Endpoints |
|---|---|
| General | `GET /jokes`, `GET /riddle`, `GET /proverbs`, `POST /riddle/<id>/answer` |
| Admin | Above plus `POST` / `PATCH` / `DELETE` on `/jokes`, `/riddle`, `/proverbs` |

Permission strings map one-to-one with routes—for example `get:jokes`, `post:riddles`, `patch:proverbs`, `delete:riddles`. The root `GET /` route returns onboarding JSON with the Auth0 authorize link and endpoint catalogue.

`model.py` defines three tables—`Jokes` (title + joke), `Riddles` (riddle + answer), `Proverbs` (proverb)—each with `insert`, `update`, and `delete` helpers. `DATABASE_URL` from the environment wires SQLAlchemy to **PostgreSQL** on Heroku. `Procfile` runs `gunicorn --bind 0.0.0.0:$PORT app:APP`.

### Auth flow

Auth0 issues the JWT; the API never stores passwords. Clients register or log in through the Auth0 authorize URL (linked from `GET /`), then send `Authorization: Bearer <token>` on every content request.

The `auth/auth.py` module decodes tokens with **python-jose**: fetch JWKS from Auth0, verify RS256 signature, audience, and issuer, then assert the route’s permission string exists in the token’s `permissions` array. Missing headers, malformed bearer tokens, expired claims, or wrong permissions return **401**—no anonymous fallback on protected routes.

Demo accounts and fixture tokens live in `Test_credentials` and `testconfig.py` for local pytest runs; production secrets (`AUTH0_DOMAIN`, `API_AUDIENCE`, `ALGORITHMS`) load from environment variables via `python-dotenv`.

### Riddle grading

Riddle answers are checked with lightweight NLP rather than exact string match. The POST handler lowercases the submission and stored answer, splits both into word lists, and compares overlap while filtering stop words from `nltkref.py` (`short_words`). A matching content word outside the stop-word list marks the answer **correct**; otherwise **wrong**. The response includes the user’s submission and the canonical answer so clients can show feedback after grading.

GET `/riddle` deliberately omits the solution—only a prompt to use the answer endpoint—so reload-to-play stays fair.

## Tech stack

The stack stays small and deployable: Flask for routing, Auth0 for identity, Postgres for content, Gunicorn on Heroku for production serving.

| Layer | Tools |
|---|---|
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-CORS |
| Auth | Auth0 JWT (`python-jose`), permission-scoped `@requires_auth` |
| Database | PostgreSQL (`DATABASE_URL`) |
| NLP | NLTK-inspired stop-word list (`nltkref.py`) for riddle grading |
| Deploy | Heroku, Gunicorn (`Procfile`) |
| Testing | `test.py`, `testconfig.py`, `Test_credentials` |

## Security notes

Tokens are short-lived Auth0 JWTs; clients re-authorize when expired. Permission claims—not a single `is_admin` flag—gate each route, so general users cannot accidentally hit delete endpoints even with a valid token.

`Test_credentials` and tokens in `testconfig.py` are for **local dev only**—never reuse demo passwords in production. HTTPS terminates at Heroku’s edge; CORS headers allow `Authorization` and standard verbs for browser clients during integration tests.

## Impact

Beyond a portfolio demo URL, the project shows how to structure a small content API the way production services do: external identity provider, scoped permissions, and a clear split between consumer GET routes and admin mutations.

- **Production-shaped API** — Auth0 permissions, role separation, and CRUD—not a single open route
- **Deployable demo** — live Heroku instance documented with curl examples in the README
- **Fair riddle flow** — answers hidden on GET, graded server-side with stop-word-aware matching
- **Clear extension point** — swap Auth0 tenants, add rate limits, or migrate models without changing route design

## Example usage

Obtain a token via Auth0 (see `GET /` or the README authorize link), then call content routes with the bearer header:

```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" https://fun-apis.herokuapp.com/jokes
curl -H "Authorization: Bearer <ACCESS_TOKEN>" https://fun-apis.herokuapp.com/riddle
curl -X POST -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"answer":"fingers"}' \
  https://fun-apis.herokuapp.com/riddle/4/answer
```

Local setup: `pip install -r requirements.txt` then `python app.py` (dev server on port 9070).

## What I learned

Wiring Auth0 permissions to Flask decorators clarifies **the same integration contract** larger APIs use—register externally, pass a bearer token, hit scoped routes—without Kubernetes or a custom auth server for a portfolio slice. Building riddle grading separately from the GET payload is a small but real API design choice: convenience for players should not leak answers by default.

## Links

Source, README curl examples, and test fixtures live in the repository; the live host is the integration target.

- [GitHub — Fun_api](https://github.com/ayotomiwasalau/Fun_api)
- [Live API — fun-apis.herokuapp.com](https://fun-apis.herokuapp.com/)
