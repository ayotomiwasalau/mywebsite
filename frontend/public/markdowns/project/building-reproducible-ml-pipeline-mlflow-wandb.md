![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/wandb-pipeline-graph.png)

A property company retrains a **rental price model weekly** as new listing data arrives. One-off notebooks do not scale—the team needed a **reusable ML pipeline** with experiment tracking, artifact lineage, and configurable steps.

[GitHub — Rental-ml-pipeline](https://github.com/ayotomiwasalau/Rental-ml-pipeline) · [Design rationale (blog)](/work/blogs/mlflow-and-wandb-tracking)

## Context

Weekly bulk data drops require automated retraining with modular stages, reproducible Conda environments, hyperparameter config that ops can override without code changes, and full artifact and metric history to compare runs and roll back bad weeks. Manual notebooks could not guarantee the same cleaning rules, test gates, or model export format week after week.

## Approach

MLflow orchestrates the steps; Weights & Biases tracks artifacts and lineage between stages. The pipeline is configured through Hydra and runnable end-to-end or step-by-step:

1. **Conda bootstrap** — `conda env create -f environment.yml && conda activate nyc_airbnb_dev`; each step also defines its own `conda.yml` for MLflow isolation.
2. **Hydra + `config.yaml`** — ETL price bounds, KL threshold, stratification column, RandomForest hyperparameters, and active step list.
3. **MLflow `run` per step** — Parent project invokes child `MLproject` directories; partial runs via `-P steps=download,basic_cleaning`.
4. **W&B artifacts** — CSV and model files pass between steps as versioned artifacts with lineage graphs.
5. **Data checks** — pytest on geo bounds and neighbourhood distribution (KL divergence vs reference) before training.
6. **Cookiecutter template** — `cookiecutter cookie-mlflow-step -o src` scaffolds new pipeline components.

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/mlflow-runs.png)

## Architecture breakdown

Each step is an isolated MLflow project with its own `conda.yml`; the parent run wires them together and passes W&B artifacts forward. Details below cover step responsibilities and run commands.

### Pipeline steps

| Step | Purpose |
|---|---|
| `download` | Fetch sample CSV, log raw W&B artifact |
| `basic_cleaning` | Remove outliers/nulls, enforce min/max price |
| `data_check` | Boundary and distribution tests vs reference |
| `data_split` | Train/val/test split with stratification |
| `train_random_forest` | TF-IDF + RandomForestRegressor, export model |
| `test_regression_model` | Holdout evaluation (R², MAE) against prod-tagged model |

### Run commands

```bash
mlflow run .
mlflow run . -P steps=download,basic_cleaning
mlflow run . -P hydra_options="modeling.random_forest.n_estimators=10 etl.min_price=50"
mlflow run src/eda   # optional EDA notebook step
```

### Tracking evidence

W&B stores artifact lineage from raw CSV through model export; MLflow UI records per-step run metadata.

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/train_data_lineage.png)

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/wandb-tag-data-test.png)

![](/images/project/building-reproducible-ml-pipeline-mlflow-wandb/mlflow_ui.png)

## Tech stack

MLflow supplies orchestration and run metadata; W&B owns artifact graphs; Hydra and Cookiecutter keep config and new steps maintainable without forking the parent project.

| Layer | Tools |
|---|---|
| Orchestration | MLflow |
| Tracking & artifacts | Weights & Biases |
| Config | Hydra |
| Model | scikit-learn (RandomForest + TF-IDF) |
| Environment | Conda (`environment.yml`, per-step `conda.yml`) |
| Scaffolding | Cookiecutter MLflow step template |
| Quality | pytest (data_check) |

## Impact

The repo is a template for weekly rental-price retraining with observable lineage—ops can rerun subsets, override hyperparameters, and audit what shipped each week.

- **Weekly retrain automation** — one command, overridable config, subset runs for debugging
- **Full artifact lineage** — raw CSV → cleaned data → splits → exported model, visible in W&B
- **Quality gates** — geo and distribution checks fail fast before expensive training
- **Extensible pipeline** — Cookiecutter and per-step `MLproject` layout simplify adding stages without rewriting orchestration

## Links

Pipeline source and step templates live in the repository; the blog walks through MLflow and W&B setup in depth.

- [GitHub — Rental-ml-pipeline](https://github.com/ayotomiwasalau/Rental-ml-pipeline)
- [Blog — MLflow & W&B experiment tracking](/work/blogs/mlflow-and-wandb-tracking)
