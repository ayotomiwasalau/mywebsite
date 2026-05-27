![](/images/project/building-movie-recommender-funksvd-python/recommender-hero.png)

Streaming platforms need more than a static catalogue — users expect recommendations that match context: cold start, a title they just liked, or a long rating history. This project is a **custom movie recommender** with three strategies instead of a one-size-fits-all third-party API.

## Problem

Off-the-shelf recommendation APIs are hard to tune for your catalogue and user behaviour. A portfolio-grade system should handle:

- **Cold start** — no user history yet
- **Item similarity** — "more like this movie"
- **Personalized ranking** — predict ratings from past behaviour

## Solution

Build a **RecommendationEngine** with three modes ([GitHub](https://github.com/ayotomiwasalau/RecommenderSystem/tree/master/RecommendationEngine)):

1. **Knowledge-based** — popular / ranked movies when the user provides no preference signal
2. **Content-based** — similar movies when the user supplies a reference title
3. **FunkSVD (matrix factorization)** — predicted ratings when user–movie history exists

Custom logic keeps recommendations relevant to the dataset rather than generic API output.

## Architecture breakdown

### Data

Movie and rating data processed with **pandas** and **numpy** for feature matrices and user–item interactions.

### Models

- **Content-based** — similarity from movie attributes for "like this title" queries
- **FunkSVD** — latent-factor model to estimate how a user would rate unseen movies
- **Knowledge-based** — fallback rankings for anonymous or low-signal sessions

### Application

The `App/` and `Project/` modules wrap inference for interactive use — choose the strategy based on available inputs.

## Tech stack

| Layer | Tools |
|---|---|
| Language | Python |
| Data | pandas, numpy |
| Modelling | FunkSVD (matrix factorization) |
| Deployment | Custom engine (no third-party rec API) |

## Impact

- **Three recommendation modes** for cold start, similarity, and personalized ranking
- **Custom tuning** — full control over features and ranking logic
- **Foundation** for production rec systems (A/B tests, retraining, hybrid rankers)

## Links

- [GitHub — RecommenderSystem / RecommendationEngine](https://github.com/ayotomiwasalau/RecommenderSystem/tree/master/RecommendationEngine)
