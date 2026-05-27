![](/images/blog/mlflow-and-wandb-tracking/architecture.png)

## System Overview

A property company retrains a **rental price model weekly** as new listing data arrives. This pipeline automates **download → clean → validate → split → train → test** using **MLflow** for step orchestration and **Weights & Biases** for artifacts and metrics. **Hydra** drives configuration; each step is an `MLproject` with its own conda environment. Run all steps with `mlflow run .` or subset steps for debugging.

## Component Breakdown

- **MLflow** — orchestrates pipeline steps; logs runs, params, and model exports
- **Weights & Biases** — artifact storage, metrics, lineage, and team visibility
- **Hydra** — `config.yaml` for ETL bounds, model hyperparameters, active step list
- **Conda** — isolated env per step via `environment.yml` and step `conda.yml` files
- **scikit-learn** — RandomForestRegressor + TF-IDF on listing text features
- **pytest data checks** — geo bounds and KL divergence vs reference distribution
- **Cookiecutter template** — scaffold new pipeline components quickly

## Design Decisions

**MLflow multi-step project** — each stage is independently runnable and logged, enabling partial reruns when only training changes.

**W&B artifacts between steps** — CSV and model files pass with versioned lineage instead of ad hoc paths.

**Hydra for config** — override hyperparameters from CLI without editing files (`hydra_options=…`).

**Quality gate before training** — distribution and boundary tests fail fast on bad weekly drops.

**Cookiecutter for new steps** — reduces boilerplate when adding stages to the pipeline.

## Trade-offs

| Pros | Cons |
|---|---|
| One-command weekly retrain | Multiple conda envs to maintain |
| Full artifact lineage in W&B | W&B + MLflow dual tooling overhead |
| Reproducible params and metrics | Initial pipeline setup is heavy |
| Subset runs for debugging | Conda env creation adds latency per step |

## Scaling Considerations

Schedule runs with **GitHub Actions** or **Airflow**, cache conda envs in CI, promote best models via W&B **tags**, and deploy exported models to a serving layer. For larger data, swap in **Spark** or **Ray** steps while keeping the MLflow/W&B contract. Use MLflow Model Registry for production promotion gates.

## Link

[View Project Case Study](/work/projects/building-reproducible-ml-pipeline-mlflow-wandb)
