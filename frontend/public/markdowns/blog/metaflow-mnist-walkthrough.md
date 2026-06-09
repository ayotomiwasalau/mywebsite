![](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_header_img.png)

The priority for many data scientists is picking the right features, building models, and deploying them—not wrestling with model versioning, job scheduling, flow architecture, or compute management. That operational work still has to happen for production ML to succeed. **Metaflow** is where this post starts.

[GitHub — mnist-with-metaflow](https://github.com/ayotomiwasalau/mnist-with-metaflow)

## System overview

**Metaflow** is an open-source tool from Netflix for managing data science workflows. It helps scientists focus on modeling while making it faster to productionize deliverables. If you know **Airflow** or **Luigi**, the role is similar: your process runs in **steps**, each step is a node, and nodes connect as a graph—a **DAG** (directed acyclic graph).

![chain-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_chain.png)

In the example above, two model variants train in parallel and evaluation picks the higher accuracy score.

Metaflow ships with a [lightweight service](https://github.com/Netflix/metaflow-service) for inspecting and tracking flow executions. On a laptop, a **local directory** stores metadata for every run—that metadata is a **data artifact**. Jupyter (or the CLI client) lets you interact with artifacts from past and in-flight runs. For team sharing and durable state, deploy Metaflow Service with **Amazon S3** as the datastore.

## What problem Metaflow solves

Operationalizing data science usually splits into orchestration (chaining ingest → train → evaluate), lineage (which data and params produced which model), and recovery (resume without rerunning expensive upstream steps). Metaflow treats each `@step` as the smallest **resumable** unit, persists **data artifacts** to a **datastore**, and records run metadata so you can **inspect, resume, and compare** runs—especially when a branch fails mid-pipeline.

## Core concepts: flow, step, transition

A Metaflow DAG is built from:

- **Flow** — manages all pipeline code; a Python class such as `class MnistFlow(FlowSpec)`.
- **Step** — smallest resumable unit of computation, marked with `@step` (e.g. `start`, `fit_predict_model1`, `join`, `end`).
- **Transition** — links between steps: linear, branch, `foreach`, and join. See the [Metaflow docs](https://docs.metaflow.org/) for details.

![compnt-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_component.jpg)

Three components wrap the flow:

| Component | Role |
|---|---|
| **Datastore** | Stores data artifacts produced along the flow. |
| **Metadata** | Stores execution information (runs, steps, status). |
| **Client** | Connects to the datastore and metadata for inspection and debugging. |

Together they support resuming runs, [inspecting](https://docs.metaflow.org/metaflow/client) metadata, hybrid local/remote execution, and collaboration.

## Setup: local, cloud, or hybrid

Install Metaflow locally or on a remote server (e.g. AWS):

```bash
pip install metaflow
```

Upgrade an existing install:

```bash
pip install --upgrade metaflow
```

**Local** runs favor fast iteration and Jupyter inspection; **remote** fits larger data and heavier compute. **Hybrid** mode switches between laptop and cloud—Metaflow snapshots code and data in the cloud so you can inspect, resume, and restore prior executions without losing work.

## MNIST walkthrough: from CSV to two models

This walkthrough trains classifiers on the [MNIST CSV dataset](https://www.kaggle.com/datasets/oddrationale/mnist-in-csv). The original MNIST images are vectorized: each row has **785 values**—label (0–9) plus **784 pixel features** (0–255). The file has **60,000** training examples.

![data-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_data.jpg)

The pipeline covers extraction, preparation, train/test split, parallel model fit and predict, and evaluation:

![steps-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_steps.jpg)

The graph maps to a `MnistFlow` class. Screenshots below show the flow definition in the repo:

![Step 1](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_wlkthru_step01.png)

![Step 2](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_wlkthru_step02.png)

### Walking through each step

**1. Load the MNIST CSV into a Pandas DataFrame**

```python
class MnistFlow(FlowSpec):
    """
    The flow performs the following steps:
    1) Ingest the MNIST csv data into Pandas DataFrame
    2) Clean and wrangle data
    3) Split data into train and test
    4) Fit model on train data (multiple models with branches)
    5) Predict on test data
    6) Evaluate result
    """

    mnist_train_data = IncludeFile(
        'mnist_data',
        help='The path to mnist data file.',
        default=script_path('mnist_train.csv'),
    )

    @step
    def start(self):
        import pandas as pd
        from io import StringIO

        self.mnist_df = pd.read_csv(StringIO(self.mnist_train_data))
        self.next(self.prepare_data)
```

**2. Prepare features and labels**

```python
    @step
    def prepare_data(self):
        self.X_df = self.mnist_df.drop(["label"], axis=1)
        self.Y_df = self.mnist_df.label.values
        self.next(self.split_data)
```

**3. Split train and test (50:50)**

```python
    @step
    def split_data(self):
        from sklearn.model_selection import train_test_split

        self.X_train, self.X_test, self.Y_train, self.Y_test = train_test_split(
            self.X_df, self.Y_df, test_size=0.5, random_state=42
        )
        self.next(self.fit_predict_model1, self.fit_predict_model2)
```

**4. Fit and predict — Gaussian Naive Bayes**

```python
    @step
    def fit_predict_model1(self):
        from sklearn.naive_bayes import GaussianNB

        modelA = GaussianNB()
        modelA.fit(self.X_train, self.Y_train)
        self.predictionA = modelA.predict(self.X_test)
        self.next(self.join)
```

**5. Fit and predict — Random Forest**

```python
    @step
    def fit_predict_model2(self):
        from sklearn.ensemble import RandomForestClassifier

        modelB = RandomForestClassifier(random_state=1)
        modelB.fit(self.X_train, self.Y_train)
        self.predictionB = modelB.predict(self.X_test)
        self.next(self.join)
```

**6. Join branches and merge artifacts**

```python
    @step
    def join(self, inputs):
        self.merge_artifacts(inputs)
        self.next(self.evaluate)
```

**7. Evaluate accuracy**

```python
    @step
    def evaluate(self):
        from sklearn.metrics import accuracy_score

        print('Accuracy score for GaussianNB {}'.format(
            accuracy_score(self.predictionA, self.Y_test)
        ))
        print('Accuracy score for RandomForest {}'.format(
            accuracy_score(self.predictionB, self.Y_test)
        ))
        self.next(self.end)
```

**8. End the run**

```python
    @step
    def end(self):
        print("finished")
```

Run the flow (from the repo directory):

```bash
python mnist_flow.py run
```

![result](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_results.png)

**Random Forest** typically beats **Gaussian Naive Bayes** on this vectorized slice—in my runs, about **93.6%** vs **56.7%** accuracy. The teaching goal is **branch + join**, not state-of-the-art digit accuracy.

## Inspecting your flow

Metaflow lets you list flows, runs, steps, and per-step artifacts—useful when debugging. Failures often surface at a specific step:

![error](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_error.png)

Inspect via **Jupyter** or the **CLI client** (this project uses a notebook):

![inspect](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_inspect0.png)

![inspect](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_inspect1.png)

The loop is: run → fail → inspect artifact at step N → fix → resume.

## Design decisions

**Python-native flows** — The DAG lives in code you can diff; no separate YAML graph file.

**Branch/join for model comparison** — Two sklearn models in parallel, one `evaluate` step—cleaner than separate jobs.

**Artifacts on `self`** — Explicit per-step state; the client reloads any step later.

**IncludeFile for training data** — Pins data to the flow version; swap for S3 paths when data outgrows the repo.

## Trade-offs

| Pros | Cons |
|---|---|
| Fast path from notebook to resumable pipeline | Another runtime beside Airflow/Kubeflow |
| Built-in artifact and run history | Heavy steps need cloud configuration |
| Branch/join fits ML experimentation | Not a full feature store or model registry |
| Hybrid local/cloud | Team sharing needs Metaflow Service + shared datastore |

## When to reach for Metaflow

Use Metaflow when the pipeline owner writes **Python**, you need **step-level resume and artifact inspection**, and workflows look like **train → evaluate → compare variants**. Prefer Airflow when coordinating **many services**, strict SLAs, and non-Python operators dominate. They can coexist: Airflow can trigger Metaflow on a schedule.

## References

- [GitHub — mnist-with-metaflow](https://github.com/ayotomiwasalau/mnist-with-metaflow)
- [Metaflow documentation](https://docs.metaflow.org/)
- [Metaflow client API](https://docs.metaflow.org/metaflow/client)
