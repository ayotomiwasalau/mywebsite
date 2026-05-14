![header-image](/images/project/experiment-tracking-blueprint/mlflow_wandb.png)

This project is about building a reproducible ML pipeline with MLflow and Weight and Biases. 
A properties company has a model that estimate the typical price for a given property based on the price of similar properties. 
They receives new data in bulk every week about properties prices, the model needs to be retrained with the same cadence, it requires an end-to-end pipeline that can be reused. It is basically to automate retraining of the machine learning model.

## Tools
MLFlow, Weight and Biases, Hydra, conda

## Implementation
First a conda environment is created from the ```environment.yml``` file and activated.

```bash
conda env create -f environment.yml
conda activate nyc_airbnb_dev
```

This is the ```environment.yml``` file

```bash
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


### Weight and Biases account

Sign up here for a [Weights and Biases account](https://wandb.ai/site/)

![account_descr](/images/project/experiment-tracking-blueprint/wandb_acc.png)
source: [https://wandb.ai/ayotomiwasalau](https://wandb.ai/ayotomiwasalau)

Log into your Weight and Biases(Wandb) account and get your API key. WandB help to store your artifacts, record your metrics, provide your team access to that data.
![account_descr](/images/project/experiment-tracking-blueprint/wandb_api.png)

Then

```bash
wandb login (your API key)

```

### Data science steps with MLFlow
MLFlow is used to create the pipeline ecapsulating all the steps required to retrain and deploy the model. These steps include

- Get the data
- Clean the data
- Check the quality of the data
- Split it into training and validation sets
- Train the model 
- Test the model


```python

    ...
    if "download" in active_steps:
            # Download file and load in W&B
            _ = mlflow.run(
                f"{config['main']['components_repository']}/get_data",
                "main",
                version='main',
                parameters={
                    "sample": config["etl"]["sample"],
                    "artifact_name": "sample.csv",
                    "artifact_type": "raw_data",
                    "artifact_description": "Raw file as downloaded"
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
                "min_price": config['etl']['min_price'],
                "max_price": config['etl']['max_price']
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
                "min_price": config['etl']['min_price'],
                "max_price": config['etl']['max_price']
            })

    if "data_split" in active_steps:
        _ = mlflow.run(
            os.path.join(hydra.utils.get_original_cwd(), "src", "train_val_test_split"),
            "main",
            parameters={
                "input": "clean_sample.csv:latest",
                "test_size": config["modeling"]["test_size"],
                "random_seed": config["modeling"]["random_seed"],
                "stratify_by": config["modeling"]["stratify_by"]
            }
        )

    if "train_random_forest" in active_steps:

        # NOTE: we need to serialize the random forest configuration into JSON
        rf_config = os.path.abspath("rf_config.json")
        with open(rf_config, "w+") as fp:
            json.dump(dict(config["modeling"]["random_forest"].items()), fp) 

        # use the rf_config we just created as the rf_config parameter for the train_random_forest
        # step

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
                "output_artifact": "random_forest_export"
            }
        )

    if "test_regression_model" in active_steps:

            _ = mlflow.run(
                f"{config['main']['components_repository']}/test_regression_model",
                "main",
                parameters={
                    "mlflow_model": "random_forest_export:prod",
                    "test_dataset": "test_data.csv:latest"
                }
            )
    ...
```

-- To run all the steps at once.
```bash
mlflow run  .

```

-- Each step can be run individually or you can specify some custom parameter value outside the config file

```bash
mlflow run . -P steps=download,basic_cleaning

mlflow run . \
  -P steps=download,basic_cleaning \
  -P hydra_options="modeling.random_forest.n_estimators=10 etl.min_price=50"
```

-- Doing exploratory data analysis, here one can carry out an analysis on the provided data.
A jupyter notebook is started and the data is assessed

```bash
   mlflow run src/eda
```
![eda-cli](/images/project/experiment-tracking-blueprint/eda_cli.png)

This will install Jupyter and all the dependencies for `pandas-profiling`, and open a Jupyter notebook instance.

![jup-nb](/images/project/experiment-tracking-blueprint/jupyter-nb.png)

This is what the reports look like

![data-report](/images/project/experiment-tracking-blueprint/datareport.png)

![data-report](/images/project/experiment-tracking-blueprint/variables.png)


### Hydra config tool
Hydra is the configuraion management tool, the hyparameters for the models are specified in the config file


```bash
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
        default: ''

    command: "python main.py main.steps=\\'{steps}\\' $(echo {hydra_options})"

```

```config``` file

```bash
main:
  # components_repository: null
  # All the intermediate files will be copied to this directory at the end of the run.
  # Set this to null if you are running in prod
  project_name: nyc_airbnb
  experiment_name: development
  steps: all
etl:
  sample: "sample1.csv"
  min_price: 10 # dollars
  max_price: 350 # dollars
data_check:
  kl_threshold: 0.2
modeling:
  # Fraction of data to use for test (the remaining will be used for train and validation)
  test_size: 0.2
  # Fraction of remaining data to use for validation
  val_size: 0.2
  # Fix this for reproducibility, change to have new splits
  random_seed: 42
  # Column to use for stratification (use "none" for no stratification)
  stratify_by: "neighbourhood_group"
  # Maximum number of features to consider for the TFIDF applied to the title of the
  # insertion (the column called "name")
  max_tfidf_features: 5
  # NOTE: you can put here any parameter that is accepted by the constructor of
  # RandomForestRegressor. This is a subsample, but more could be added:
  random_forest:
    n_estimators: 500
    max_depth: 50
    min_samples_split: 4
    min_samples_leaf: 3
    # Here -1 means all available cores
    n_jobs: -1
    criterion: squared_error
    max_features: 0.5
    # DO not change the following
    oob_score: true
```

To view all the existing conda environments
```python
conda info --envs | grep mlflow | cut -f1 -d" "
```

To uninstall all environment (this code will uninstall all the environments, use cautiously)
```python
for e in $(conda info --envs | grep mlflow | cut -f1 -d" "); do conda uninstall --name $e --all -y;done
```


### MLFlow pipeline directory

This shows folder and file structure in the project

```bash

├── CODEOWNERS
├── LICENSE.txt
├── MLproject
├── README.md
├── components
│   ├── README.md
│   ├── conda.yml
│   ├── setup.py
│   └── wandb_utils
│       ├── __init__.py
│       ├── __pycache__
│       │   ├── __init__.cpython-313.pyc
│       │   └── log_artifact.cpython-313.pyc
│       ├── log_artifact.py
│       └── sanitize_path.py
├── conda.yml
├── config.yaml
├── cookie-mlflow-step
│   ├── README.md
│   ├── cookiecutter.json
│   └── {{cookiecutter.step_name}}
│       ├── MLproject
│       ├── conda.yml
│       └── {{cookiecutter.script_name}}
├── environment.yml
├── images
│   ├── tag-release-github.png
│   ├── wandb-pipeline-graph.png
│   ├── wandb-tag-data-test.png
│   └── wandb_select_best.gif
├── main.py
└── src
    ├── basic_cleaning
    │   ├── MLproject
    │   ├── artifacts
    │   │   └── sample.csv-latest
    │   │       └── sample1.csv
    │   ├── conda.yml
    │   └── run.py
    ├── data_check
    │   ├── MLproject
    │   ├── artifacts
    │   │   ├── clean_sample.csv-latest
    │   │   │   └── clean_sample.csv
    │   │   └── clean_sample.csv-reference
    │   │       └── clean_sample.csv
    │   ├── conda.yml
    │   ├── conftest.py
    │   └── test_data.py
    ├── eda
    │   ├── EDA.ipynb
    │   ├── MLproject
    │   ├── conda.yml
    │   ├── report.html
    │   └── report2.html
    ├── get_data
    │   ├── MLproject
    │   ├── __init__.py
    │   ├── conda.yml
    │   ├── data
    │   │   ├── sample1.csv
    │   │   └── sample2.csv
    │   └── run.py
    ├── test_regression_model
    │   ├── MLproject
    │   ├── conda.yml
    │   └── run.py
    ├── train_random_forest
    │   ├── MLproject
    │   ├── artifacts
    │   │   └── trainval_data.csv-latest
    │   │       ├── tmp7i1vjj0p
    │   │       ├── tmpigxe9arm
    │   │       └── tmpzqfcrzjv
    │   ├── conda.yml
    │   ├── feature_engineering.py
    │   ├── random_forest_dir
    │   │   ├── MLmodel
    │   │   ├── conda.yaml
    │   │   ├── input_example.json
    │   │   ├── model.pkl
    │   │   ├── python_env.yaml
    │   │   ├── requirements.txt
    │   │   └── serving_input_example.json
    │   └── run.py
    └── train_val_test_split
        ├── MLproject
        ├── artifacts
        │   └── clean_sample.csv-latest
        │       └── clean_sample.csv
        ├── conda.yml
        └── run.py
```


### Cookie cutter
Cookie cutter template helps you create stubs for your new pipeline component.
It will save you a bit of boiler plate code. Run the cookiecutter and enter the required information, and a new component 
will be created including the `conda.yml` file, the `MLproject` file as well as the script.

For example:

```bash
> cookiecutter cookie-mlflow-step -o src

step_name [step_name]: basic_cleaning
script_name [run.py]: run.py
job_type [my_step]: basic_cleaning
short_description [My step]: This steps cleans the data
long_description [An example of a step using MLflow and Weights & Biases]: Performs basic cleaning on the data and save the results in Weights & Biases
parameters [parameter1,parameter2]: parameter1,parameter2,parameter3
```

This will create a step called ``basic_cleaning`` under the directory ``src`` with the following structure:

```bash
> ls src/basic_cleaning/
conda.yml  MLproject  run.py
```

You can now modify the script (``run.py``) with your data science logic and interact with artifact in WandB, as well as the conda environment (``conda.yml``) and the project definition 
(``MLproject``) as you please.


### Interfacing  MLFlow pipeline code with WandB

Initialize a step with WandB to capture the run metadatas

```python
run = wandb.init(job_type="download_file")
run.config.update(args)
```

Reference a data artifact stored in WandB using the below code

```python
local_path = run.use_artifact("sample.csv:latest").file()
df = pd.read_csv(local_path)
```

Log or upload a data artifact to WandB 

```python
 artifact = wandb.Artifact(
    args.output_artifact,
    type=args.output_type,
    description=args.output_description,
)
file_name = "clean_sample.csv"
artifact.add_file(file_name)
run.log_artifact(artifact)
```


Setting up tests in the MLflow pipeline to check the quality of the data 

```python
def test_proper_boundaries(data: pd.DataFrame):
    """
    Test proper longitude and latitude boundaries for properties in and around NYC
    """
    idx = data['longitude'].between(-74.25, -73.50) & data['latitude'].between(40.5, 41.2)

    assert np.sum(~idx) == 0


def test_similar_neigh_distrib(data: pd.DataFrame, ref_data: pd.DataFrame, kl_threshold: float):
    """
    Apply a threshold on the KL divergence to detect if the distribution of the new data is
    significantly different than that of the reference dataset
    """
    dist1 = data['neighbourhood_group'].value_counts().sort_index()
    dist2 = ref_data['neighbourhood_group'].value_counts().sort_index()

    assert scipy.stats.entropy(dist1, dist2, base=2) < kl_threshold
```

Save a model artifact to WandB

```python
mlflow.sklearn.save_model(
    sk_pipe,
    export_path,
    signature=infer_signature(X_val, y_pred),
    serialization_format=mlflow.sklearn.SERIALIZATION_FORMAT_CLOUDPICKLE,
    input_example=X_val.iloc[:5]
)

artifact = wandb.Artifact(
    args.output_artifact,
    type="model_export",
    description="Training pipeline artifact",
    metadata=rf_config
)
artifact.add_dir(export_path)
run.log_artifact(artifact)
```

Save evaluation metrics to WandB. In this case we have r-square and mean absolute error to measure the parformance of the regression model.


```python
# Plot feature importance
fig_feat_imp = plot_feature_importance(sk_pipe, processed_features)

######################################
# Here we save r_squared under the "r2" key
run.summary['r2'] = r_squared
# Now log the variable "mae" under the key "mae".
run.summary['mae'] = mae

# Upload to W&B the feture importance visualization
run.log(
    {
        "feature_importance": wandb.Image(fig_feat_imp),
    }
)
```
### Outputs from WandB and MLflow

The images shows the aritifacts, metrics and runs metadata stored on WandB. 
This shows the training data after being loaded from the split step
![header-image](/images/project/experiment-tracking-blueprint/train_data_arte.png)

This shows the data lineage of the data
![header-image](/images/project/experiment-tracking-blueprint/train_data_lineage.png)

This shows the model artifacts and parameter trained with it 
![header-image](/images/project/experiment-tracking-blueprint/model_artefact.png)
Model params
![header-image](/images/project/experiment-tracking-blueprint/model_params.png)

Here we have the runs metadata, the metrics from each run step
![header-image](/images/project/experiment-tracking-blueprint/runs_data.png)
This shows the result from the runs
![header-image](/images/project/experiment-tracking-blueprint/runs_ml.png)

MLflow also has a UI for recording runs metadata
![header-image](/images/project/experiment-tracking-blueprint/mlflow_ui.png)

Here we have the runs for each step of the pipeline retraining process
![header-image](/images/project/experiment-tracking-blueprint/mlflow_runs.png)
![header-image](/images/project/experiment-tracking-blueprint/mlflow_run_metadata.png)

Here this the overview of the metadata for a run
![header-image](/images/project/experiment-tracking-blueprint/overview_runs.png)

## Media
- [Project repository](https://github.com/ayotomiwasalau/Rental-ml-pipeline)
- [Youtube long-form explanatory video](https://www.youtube.com/watch?v=qKgHW3ZFbvA)
- [Tiktok short-form video](https://www.tiktok.com/@ayotomiwasalau/video/7479813273529879814)
- [Instagram short-form video](https://www.instagram.com/reel/DG_XHenIBxA)
- [X thread](https://x.com/ayotomiwasalau)