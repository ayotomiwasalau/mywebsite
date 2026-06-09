![](/images/blog/mlflow-and-wandb-tracking/architecture.png)

This post walks through a **reproducible ML pipeline** for weekly model retraining: **MLflow** orchestrates the steps, **Weights & Biases (W&B)** stores artifacts and metrics, and **Hydra** holds hyperparameters in `config.yaml`.

A property company estimates typical rental prices from similar listings. New bulk price data arrives every week, so the model must be retrained on the same cadence with an **end-to-end pipeline that can be reused**—not a one-off notebook.

[GitHub — Rental-ml-pipeline](https://github.com/ayotomiwasalau/Rental-ml-pipeline) · [Project case study](/work/projects/building-reproducible-ml-pipeline-mlflow-wandb)

**Tools:** MLflow, Weights & Biases, Hydra, Conda.

## System overview

The domain is NYC Airbnb-style rental listings modeled with **RandomForestRegressor** and **TF-IDF** on listing text. Each weekly drop flows through the same stages—fetch, clean, validate, split, train, and evaluate—with isolated Conda environments per step, logged parameters, and versioned artifacts so operators can compare this week’s model to last week’s and roll back if quality regresses.

The pipeline chain is: **download → basic_cleaning → data_check → data_split → train_random_forest → test_regression_model**. Each stage is its own `MLproject`; the root entry point invokes child steps via `mlflow.run`. You can run the full chain with one command or a subset of steps for debugging.

## Environment setup

Create and activate the development Conda environment from `environment.yml`:

```bash
conda env create -f environment.yml
conda activate nyc_airbnb_dev
```

```yaml
name: nyc_airbnb_dev
channels:
  - conda-forge
  - defaults
dependencies:
  - python
  - hydra-core
  - matplotlib
  - pandas
  - jupyterlab
  - pip
  - pip:
      - mlflow
      - wandb
```

Each pipeline step also has its own `conda.yml` so MLflow materializes the right dependencies when that step runs in isolation.

## Weights & Biases setup

Sign up for a [Weights & Biases account](https://wandb.ai/site/), then log in and copy your API key from the dashboard. W&B stores artifacts, records metrics, and gives your team a shared view of runs and lineage.

![](/images/blog/mlflow-and-wandb-tracking/wandb_acc.png)

Source: [wandb.ai/ayotomiwasalau](https://wandb.ai/ayotomiwasalau)

![](/images/blog/mlflow-and-wandb-tracking/wandb_api.png)

```bash
wandb login
```

Paste your API key when prompted.

## MLflow pipeline orchestration

MLflow wraps every step required to retrain and evaluate the model:

| Step | Purpose |
|---|---|
| Get the data | Download sample CSV, log raw W&B artifact |
| Clean the data | Remove outliers and nulls, enforce price bounds |
| Check data quality | pytest on geo bounds and neighbourhood distribution |
| Split data | Train / validation / test with stratification |
| Train the model | TF-IDF + RandomForest, export sklearn artifact |
| Test the model | Holdout regression metrics against a prod-tagged model |

The parent `main.py` reads Hydra config and invokes steps conditionally:

```python
if "download" in active_steps:
    _ = mlflow.run(
        f"{config['main']['components_repository']}/get_data",
        "main",
        version="main",
        parameters={
            "sample": config["etl"]["sample"],
            "artifact_name": "sample.csv",
            "artifact_type": "raw_data",
            "artifact_description": "Raw file as downloaded",
        },
    )

if "basic_cleaning" in active_steps:
    _ = mlflow.run(
        os.path.join(hydra.utils.get_original_cwd(), "src", "basic_cleaning"),
        "main",
        parameters={
            "input_artifact": "sample.csv:latest",
            "output_artifact": "clean_sample.csv",
            "output_type": "clean_sample",
            "output_description": "Data with outliers and null values removed",
            "min_price": config["etl"]["min_price"],
            "max_price": config["etl"]["max_price"],
        },
    )

if "data_check" in active_steps:
    _ = mlflow.run(
        os.path.join(hydra.utils.get_original_cwd(), "src", "data_check"),
        "main",
        parameters={
            "csv": "clean_sample.csv:latest",
            "ref": "clean_sample.csv:reference",
            "kl_threshold": config["data_check"]["kl_threshold"],
            "min_price": config["etl"]["min_price"],
            "max_price": config["etl"]["max_price"],
        },
    )

if "data_split" in active_steps:
    _ = mlflow.run(
        os.path.join(hydra.utils.get_original_cwd(), "src", "train_val_test_split"),
        "main",
        parameters={
            "input": "clean_sample.csv:latest",
            "test_size": config["modeling"]["test_size"],
            "random_seed": config["modeling"]["random_seed"],
            "stratify_by": config["modeling"]["stratify_by"],
        },
    )

if "train_random_forest" in active_steps:
    rf_config = os.path.abspath("rf_config.json")
    with open(rf_config, "w+") as fp:
        json.dump(dict(config["modeling"]["random_forest"].items()), fp)

    _ = mlflow.run(
        os.path.join(hydra.utils.get_original_cwd(), "src", "train_random_forest"),
        "main",
        parameters={
            "trainval_artifact": "trainval_data.csv:latest",
            "val_size": config["modeling"]["val_size"],
            "random_seed": config["modeling"]["random_seed"],
            "stratify_by": config["modeling"]["stratify_by"],
            "rf_config": rf_config,
            "max_tfidf_features": config["modeling"]["max_tfidf_features"],
            "output_artifact": "random_forest_export",
        },
    )

if "test_regression_model" in active_steps:
    _ = mlflow.run(
        f"{config['main']['components_repository']}/test_regression_model",
        "main",
        parameters={
            "mlflow_model": "random_forest_export:prod",
            "test_dataset": "test_data.csv:latest",
        },
    )
```

### Run commands

Run all steps:

```bash
mlflow run .
```

Run a subset or override Hydra values without editing `config.yaml`:

```bash
mlflow run . -P steps=download,basic_cleaning

mlflow run . \
  -P steps=download,basic_cleaning \
  -P hydra_options="modeling.random_forest.n_estimators=10 etl.min_price=50"
```

### Exploratory data analysis

For ad hoc analysis, start the EDA step (installs Jupyter and profiling dependencies, then opens a notebook):

```bash
mlflow run src/eda
```

![](/images/blog/mlflow-and-wandb-tracking/eda_cli.png)

![](/images/blog/mlflow-and-wandb-tracking/jupyter-nb.png)

Example profiling output:

![](/images/blog/mlflow-and-wandb-tracking/datareport.png)

![](/images/blog/mlflow-and-wandb-tracking/variables.png)

## Hydra configuration

Hydra is the configuration layer; MLflow owns execution (subprocesses, Conda envs, run IDs). The root `MLproject` exposes `steps` and `hydra_options`:

```yaml
name: nyc_airbnb
conda_env: conda.yml

entry_points:
  main:
    parameters:
      steps:
        description: Comma-separated list of steps to execute (useful for debugging)
        type: str
        default: all
      hydra_options:
        description: Other configuration parameters to override
        type: str
        default: ""
    command: "python main.py main.steps=\\'{steps}\\' $(echo {hydra_options})"
```

`config.yaml` holds ETL bounds, data-check thresholds, and model hyperparameters:

```yaml
main:
  project_name: nyc_airbnb
  experiment_name: development
  steps: all
etl:
  sample: "sample1.csv"
  min_price: 10
  max_price: 350
data_check:
  kl_threshold: 0.2
modeling:
  test_size: 0.2
  val_size: 0.2
  random_seed: 42
  stratify_by: "neighbourhood_group"
  max_tfidf_features: 5
  random_forest:
    n_estimators: 500
    max_depth: 50
    min_samples_split: 4
    min_samples_leaf: 3
    n_jobs: -1
    criterion: squared_error
    max_features: 0.5
    oob_score: true
```

List MLflow-created Conda envs:

```bash
conda info --envs | grep mlflow | cut -f1 -d" "
```

To remove all MLflow step environments (use with care):

```bash
for e in $(conda info --envs | grep mlflow | cut -f1 -d" "); do conda uninstall --name $e --all -y; done
```

## Project layout

```text
├── MLproject
├── config.yaml
├── environment.yml
├── main.py
├── components/
│   └── wandb_utils/
├── cookie-mlflow-step/
└── src/
    ├── basic_cleaning/
    ├── data_check/
    ├── eda/
    ├── get_data/
    ├── test_regression_model/
    ├── train_random_forest/
    └── train_val_test_split/
```

Each step under `src/` contains `MLproject`, `conda.yml`, and `run.py` (or tests in `data_check`).

## Cookiecutter for new steps

`cookiecutter cookie-mlflow-step` scaffolds a new pipeline component with `conda.yml`, `MLproject`, and a starter script:

```bash
cookiecutter cookie-mlflow-step -o src

step_name [step_name]: basic_cleaning
script_name [run.py]: run.py
job_type [my_step]: basic_cleaning
short_description [My step]: This step cleans the data
long_description [An example of a step using MLflow and Weights & Biases]: Performs basic cleaning on the data and save the results in Weights & Biases
parameters [parameter1,parameter2]: parameter1,parameter2,parameter3
```

Result:

```text
src/basic_cleaning/
  conda.yml  MLproject  run.py
```

## Interfacing steps with W&B

Initialize a step and sync run config:

```python
run = wandb.init(job_type="download_file")
run.config.update(args)
```

Read an input artifact:

```python
local_path = run.use_artifact("sample.csv:latest").file()
df = pd.read_csv(local_path)
```

Log an output artifact:

```python
artifact = wandb.Artifact(
    args.output_artifact,
    type=args.output_type,
    description=args.output_description,
)
artifact.add_file("clean_sample.csv")
run.log_artifact(artifact)
```

### Data quality tests

The `data_check` step uses pytest before training:

```python
def test_proper_boundaries(data: pd.DataFrame):
    """Longitude and latitude boundaries for NYC-area properties."""
    idx = data["longitude"].between(-74.25, -73.50) & data["latitude"].between(40.5, 41.2)
    assert np.sum(~idx) == 0


def test_similar_neigh_distrib(data: pd.DataFrame, ref_data: pd.DataFrame, kl_threshold: float):
    """KL divergence vs reference neighbourhood_group distribution."""
    dist1 = data["neighbourhood_group"].value_counts().sort_index()
    dist2 = ref_data["neighbourhood_group"].value_counts().sort_index()
    assert scipy.stats.entropy(dist1, dist2, base=2) < kl_threshold
```

### Model export and metrics

Save the sklearn pipeline and register it as a W&B artifact:

```python
mlflow.sklearn.save_model(
    sk_pipe,
    export_path,
    signature=infer_signature(X_val, y_pred),
    serialization_format=mlflow.sklearn.SERIALIZATION_FORMAT_CLOUDPICKLE,
    input_example=X_val.iloc[:5],
)

artifact = wandb.Artifact(
    args.output_artifact,
    type="model_export",
    description="Training pipeline artifact",
    metadata=rf_config,
)
artifact.add_dir(export_path)
run.log_artifact(artifact)
```

Log R², MAE, and feature importance:

```python
fig_feat_imp = plot_feature_importance(sk_pipe, processed_features)
run.summary["r2"] = r_squared
run.summary["mae"] = mae
run.log({"feature_importance": wandb.Image(fig_feat_imp)})
```

## W&B and MLflow outputs

W&B holds artifacts, metrics, and run metadata across the pipeline.

Training data after the split step:

![](/images/blog/mlflow-and-wandb-tracking/train_data_arte.png)

Artifact lineage from raw CSV through model export:

![](/images/blog/mlflow-and-wandb-tracking/train_data_lineage.png)

Model artifact and parameters:

![](/images/blog/mlflow-and-wandb-tracking/model_artefact.png)

![](/images/blog/mlflow-and-wandb-tracking/model_params.png)

Per-step run metrics:

![](/images/blog/mlflow-and-wandb-tracking/runs_data.png)

![](/images/blog/mlflow-and-wandb-tracking/runs_ml.png)

MLflow UI for local run comparison:

![](/images/blog/mlflow-and-wandb-tracking/mlflow_ui.png)

Per-step pipeline runs:

![](/images/blog/mlflow-and-wandb-tracking/mlflow_runs.png)

![](/images/blog/mlflow-and-wandb-tracking/mlflow_run_metadata.png)

Run overview:

![](/images/blog/mlflow-and-wandb-tracking/overview_runs.png)

## Design notes

**Why MLflow + W&B** — MLflow drives execution and records parent/child runs; W&B is the team-visible artifact hub with lineage graphs and dashboards. MLflow answers “which step failed on the runner?”; W&B answers “which CSV trained model v12?”

**Artifact handoffs** — Steps use `run.use_artifact("sample.csv:latest")` and `run.log_artifact(...)` so references like `clean_sample.csv:latest` resolve across machines instead of brittle local paths.

**Quality before training** — Geo and KL-distribution tests catch bad weekly extracts before expensive training. Tune `kl_threshold` against historical weeks.

**Weekly cadence** — The same `mlflow run .` entry point each week; tags such as `random_forest_export:prod` give the test step a stable model pointer for schedulers (Airflow, GitHub Actions, etc.).

| Pros | Cons |
|---|---|
| One-command full or partial retrain | Two UIs and APIs to learn |
| Versioned artifact lineage | Conda env per step adds cold-start latency |
| Hydra overrides without code edits | Initial scaffolding is heavyweight |
| Quality gates before training | W&B cloud dependency for shared artifacts |

## Media and links

- [Project repository](https://github.com/ayotomiwasalau/Rental-ml-pipeline)
- [Project case study](/work/projects/building-reproducible-ml-pipeline-mlflow-wandb)
- [YouTube — long-form walkthrough](https://www.youtube.com/watch?v=qKgHW3ZFbvA)
- [TikTok — short demo](https://www.tiktok.com/@ayotomiwasalau/video/7479813273529879814)
- [Instagram reel](https://www.instagram.com/reel/DG_XHenIBxA)
- [X thread](https://x.com/ayotomiwasalau)
