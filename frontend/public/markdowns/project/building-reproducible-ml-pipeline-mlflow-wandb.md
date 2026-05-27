![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/wandb-pipeline-graph.png)

A property company retrains a **rental price model weekly** as new listing data arrives. One-off notebooks do not scale — the team needed a **reusable ML pipeline** with experiment tracking, artifact lineage, and configurable steps.

## Problem

Weekly bulk data drops require automated retraining with:

- **Modular steps** (download, clean, validate, split, train, test)
- **Reproducible environments** and hyperparameter config
- **Artifact and metric history** across runs for comparison
- Ability to run **all steps or a subset** for debugging

## Solution

MLflow-orchestrated pipeline with Weights & Biases ([GitHub — Rental-ml-pipeline](https://github.com/ayotomiwasalau/Rental-ml-pipeline)):

1. **Hydra + `config.yaml`** — ETL bounds, model params, active step list
2. **MLflow `run` per step** — each component is its own `MLproject` with conda env
3. **W&B artifacts** — pass CSV and model artifacts between steps with lineage
4. **Data checks** — pytest tests on geo bounds and KL divergence vs reference distribution
5. **Cookiecutter template** — scaffold new pipeline components quickly

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/mlflow-runs.png)

## Architecture breakdown

### Pipeline steps

| Step | Purpose |
|---|---|
| `download` | Fetch sample CSV, log raw artifact |
| `basic_cleaning` | Outlier/null removal, price bounds |
| `data_check` | Distribution and boundary tests |
| `data_split` | Train/val/test with stratification |
| `train_random_forest` | TF-IDF + RandomForestRegressor, export model |
| `test_regression_model` | Holdout evaluation (R², MAE) |

### Run commands

```bash
mlflow run .
mlflow run . -P steps=download,basic_cleaning
mlflow run . -P hydra_options="modeling.random_forest.n_estimators=10 etl.min_price=50"
```

### Tracking

- **W&B** — artifacts, metrics, feature importance plots, data lineage
- **MLflow UI** — per-step run metadata and model exports

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/train_data_lineage.png)

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/wandb-tag-data-test.png)

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/mlflow_ui.png)

## Tech stack

| Layer | Tools |
|---|---|
| Orchestration | MLflow |
| Tracking | Weights & Biases |
| Config | Hydra |
| Model | scikit-learn (RandomForest + TF-IDF) |
| Env | Conda (`environment.yml`) |
| Scaffolding | Cookiecutter MLflow step template |

## Impact

- **Weekly retrain automation** with one command and overridable config
- **Full artifact lineage** from raw CSV through exported model
- **Quality gates** before training — geo bounds and distribution drift checks

## Links

- [GitHub — Rental-ml-pipeline](https://github.com/ayotomiwasalau/Rental-ml-pipeline)
- [Blog — MLflow & W&B experiment tracking](/posts/mlflow-and-wandb-tracking)
