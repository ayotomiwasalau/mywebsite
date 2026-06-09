![](/images/project/building-movie-recommender-funksvd-python/rfunc.png)

Streaming products need recommendations that adapt to **how much you know about the user**: nothing yet, a title they just liked, or a long rating history. This project is a **custom movie recommender** built in Python with three explicit strategies—popularity, content similarity, and FunkSVD matrix factorization—instead of a generic third-party API.

[GitHub — RecommenderSystem / RecommendationEngine](https://github.com/ayotomiwasalau/RecommenderSystem)

## Context

Off-the-shelf recommendation APIs hide ranking logic, make cold-start behaviour hard to control, and rarely explain *why* a title surfaced. For a portfolio-grade system on MovieLens-style data, the engine had to cover three distinct user states without forcing one model to answer every query:

- **Cold start** — no ratings yet; still show sensible picks
- **Item similarity** — “more like this movie” from attributes
- **Personalized ranking** — predict scores for unseen titles from past behaviour

## Approach

A single **RecommendationEngine** selects a strategy at runtime based on what the caller knows about the user—no ratings, a seed title, or a history of scores. Each mode is a first-class code path rather than a post-hoc fallback bolted onto one model:

1. **Knowledge-based** — popularity / average-rating rankings when no user signal exists
2. **Content-based** — similar movies from feature similarity when the user names a reference title
3. **FunkSVD** — matrix factorization to estimate ratings for user–movie pairs with history

![](/images/project/building-movie-recommender-funksvd-python/rfuncii.png)


Data flows through **pandas** and **numpy** matrices; FunkSVD learns latent factors for users and movies. The `App/` and `Project/` modules wrap inference so the UI picks the strategy based on available inputs—no single model forced for every session.

Content-based similarity uses movie attributes (genre, tags, etc.) for explainable “because you watched X” style results. FunkSVD handles the collaborative signal when ratings exist.

### Evaluation mindset

Choosing the right mode is as important as tuning any one algorithm. Each strategy below is honest only when its input signal exists—and the engine falls back when it does not.

Knowledge-based mode is the **fallback** when user ID is unknown—popular movies with strong average ratings. Content-based mode needs a seed title; similarity is cosine-style distance on feature vectors. FunkSVD mode trains latent factors on the user–item matrix and ranks unseen movies by predicted score—useful when you have enough ratings per user to avoid empty factors.

The engine API lets the application choose the mode at runtime instead of maintaining three separate microservices.

## Tech stack

The implementation stays in plain Python and numpy/pandas so each mode remains readable and easy to extend—no hosted rec API or opaque black-box service in the middle.

| Layer | Tools |
|---|---|
| Language | Python |
| Data | pandas, numpy |
| Modelling | FunkSVD (matrix factorization), content similarity |
| Deployment | Custom engine (no external rec API) |

## Possible extensions

The current codebase optimizes for clarity and mode switching in demos; a production deployment would blend signals, measure ranking quality, and retrain on a schedule. Natural next steps include hybrid ranking (blend content + FunkSVD scores), explicit evaluation on holdout ratings, and batch retrain jobs—while keeping **clear mode switching** and readable Python ahead of serving latency for now.

MovieLens-style rating sparsity is handled by falling back to knowledge-based lists when matrix factorization lacks data for a user—avoiding empty recommendation screens in demos.

## Impact

Beyond showing FunkSVD on a familiar dataset, the project demonstrates how to structure a recommender so product and engineering can reason about cold start, similarity, and personalization in one place.

- **Three modes** cover cold start, similarity, and personalized ranking in one codebase
- **Full control** over features, fallbacks, and ranking logic for A/B experiments later
- **Foundation** for production patterns—retrain schedules, hybrid rankers, evaluation holdouts
- **Demonstrates matrix factorization** without hiding behind a hosted recommendation SaaS API

## What I learned

Implementing three modes side by side clarifies **when collaborative filtering actually helps**—and when a simple popularity baseline is the honest answer. That split is worth documenting in any rec-system interview or design review. The GitHub tree under `RecommendationEngine` is the entry point for running the app against sample MovieLens-style data.

## Links

Application code, sample data paths, and the `RecommendationEngine` entry point live in the repository below.

- [GitHub — RecommenderSystem / RecommendationEngine](https://github.com/ayotomiwasalau/RecommenderSystem)
