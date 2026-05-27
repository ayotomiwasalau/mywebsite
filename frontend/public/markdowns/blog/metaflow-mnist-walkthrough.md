The priority of data scientists simply lies in picking out the right features, building and deploying their models. They do not like to be particularly bothered about other aspects like model versioning, job scheduling, flow architecture, and compute resource management, which are needed to make operationalizing data science successful. This is where Metaflow comes in.

![header-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_header_img.png)

## What is Metaflow?

Metaflow is an open-source tool by Netflix for managing data science workflows. It aims to boost the productivity of data scientists by allowing them to focus on actual data science work and by facilitating faster productionization of their deliverables. If you are familiar with Airflow or Luigi, then you would understand the function of Metaflow. It allows you to run your data science process in steps, so each step is a node in the process and the nodes are connected like a graph.

![chain-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_chain.png)

This system is called a DAG, Directed Acyclic Graph. In this hypothetical example, the flow trains two versions of models in parallel and outputs the highest accuracy score.

One other interesting attribute of Metaflow is that it ships with a [lightweight service](https://github.com/Netflix/metaflow-service) that provides a centralized place to inspect and track all your flow executions. Metaflow will use a local directory to keep track of all metadata on executions from your laptop. This metadata is called a Data Artifact.

You can use a local Jupyter notebook to interact with data artifacts from all your previous executions as well as currently running ones. However, deploying the Metaflow service alongside Amazon S3 as a datastore is helpful if you would like to share results with your peers and track your work without fear of losing any state.

## Basic Components of Metaflow

A Metaflow DAG essentially consists of the flow, step, and transition.

- **Flow**: The instance that manages all the code for the pipeline. It is a Python object in this case `class MyFlow(Flowspec)`.
- **Steps**: A step is the smallest resumable unit of computation, delimited by decorator `@step`. They are Python functions in the MyFlow object, in this case, `def start`, `fitA`, `fitB`, `eval`, `end`.
- **Transitions**: Links between the steps could be of different types (linear, branch, and for each); there are more details in the [documentation](https://docs.metaflow.org/).

![compnt-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_component.jpg)

There are 3 components around the flow:

- **Datastore**: The place where all the data (data artifact) generated all along the flow is stored.
- **Metadata**: The place where the information on the execution of the flow is stored.
- **Client**: The component that is the connection to access the data in the datastore and get information on the flow from the metadata.

These components around the flow allow data scientists to resume a run, [inspect](https://docs.metaflow.org/metaflow/client) run metadata, do hybrid runs, and collaborate.

## Setting Up Metaflow

One can make use of Metaflow on both local and remote servers like AWS. On local and remote servers, one can easily install Metaflow by simply:

```bash
pip install metaflow
```

Or upgrade already installed Metaflow:

```bash
pip install --upgrade metaflow
```

Now, one can prefer the remote option given the scale of the data and resource needed, or the local where fast interaction is required but the resource constraint would be there. There is also the hybrid method to get the best of both worlds — local and remote — by switching easily between both servers. Metaflow snapshots all data and code in the cloud automatically. This means that you can inspect, resume, and restore any previous Metaflow execution without having to worry that the fruits of your hard work get lost.

## Starting Your Data Science/Machine Learning Project: MNIST

For this post, we will build a data science workflow for training a machine learning model using the MNIST dataset. The [MNIST](https://www.kaggle.com/datasets/oddrationale/mnist-in-csv) dataset originally is a database of handwritten digit images but for this project, the image data has been converted to CSV format using its channels — RGB — as features in the dataset i.e. vectorized.

The data file contains the 60,000 examples and labels. Each row consists of 785 values: the first value is the label (a number from 0 to 9) and the remaining 784 values are the pixel values (a number from 0 to 255).

![data-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_data.jpg)

It would involve data extraction, data preparation, data split, model fitting and prediction, and model evaluation. The above graph can be represented in the code below.

![steps-image](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_steps.jpg)

![Step 1](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_wlkthru_step01.png)

![Step 2](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_wlkthru_step02.png)

### Walking Through Each Step in the Graph

1. **Set the path to the MNIST data file and load the dataset into a Pandas data frame**:

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

    mnist_train_data = IncludeFile('mnist_data',
        help='The path to mnist data file.',
        default=script_path('mnist_train.csv'))

    @step
    def start(self):
        """
            Load the data
        """
        import pandas as pd
        from io import StringIO

        # Read data from csv file
        self.mnist_df = pd.read_csv(StringIO(self.mnist_train_data))
        self.next(self.prepare_data)
```

2. **Prepare the dataset by extracting the features and the label from the whole dataset**:

```python
@step
def prepare_data(self):

    """
        prepare data
    """
    # Extract the features and the label from the data
    self.X_df = self.mnist_df.drop(["label"], axis=1)
    self.Y_df = self.mnist_df.label.values

    self.next(self.split_data)
```

3. **Split the data into train and test set in the ratio of 50:50**:

```python
@step
def split_data(self):
    """
        Split train data for modelling
    """
    from sklearn.model_selection import train_test_split

    # Split data into train and test set
    self.X_train, self.X_test, self.Y_train, self.Y_test = train_test_split(
        self.X_df, self.Y_df, test_size=0.5, random_state=42
        )
    self.next(self.fit_predict_model1, self.fit_predict_model2)
```

4. **Fit and predict on the data for the Gaussian Naive Bayes model**:

```python
@step
def fit_predict_model1(self):
    """
        Fit a gaussian naive bayes model to the data
    """
    # Import model
    from sklearn.naive_bayes import GaussianNB

    modelA = GaussianNB()

    # Fit the model
    modelA.fit(self.X_train, self.Y_train)

    # Predict
    self.predictionA = modelA.predict(self.X_test)

    self.next(self.join)
```

5. **Fit and predict on the data for the Random Forest model**:

```python
@step
def fit_predict_model2(self):
    """
        Fit a Random forest model to the data
    """
    # Import model
    from sklearn.ensemble import RandomForestClassifier

    modelB = RandomForestClassifier(random_state=1)

    # Fit the model
    modelB.fit(self.X_train, self.Y_train)

    # Predict
    self.predictionB = modelB.predict(self.X_test)

    self.next(self.join)
```

6. **Join the two branches on which the classification models are running and merge data artifacts from the two branches**:

```python
@step
def join(self, inputs):
    """
        merge the data artifact from the models
    """

    # merge artifacts during a join
    self.merge_artifacts(inputs)

    self.next(self.evaluate)
```

7. **Evaluate the model**:

```python
@step
def evaluate(self):
    """
        Evaluate the score of the models
    """

    from sklearn.metrics import accuracy_score

    # Measure accuracy
    print('Accuracy score for GaussianNB {}'.format(
        accuracy_score(self.predictionA, self.Y_test)
        ))
    print('Accuracy score for RandomForest {}'.format(
        accuracy_score(self.predictionB, self.Y_test)
        ))

    self.next(self.end)
```

8. **End the run**:

```python
@step
def end(self):
    """
        End of flow
    """

    print("finished")
```

See the result of the flow run:

![result](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_results.png)

We can see that the Random Forest model performed better than the Gaussian Naive Bayes model with a score of 93.6% compared to 56.7%.

## Inspecting Your Flow

With Metaflow, we can also inspect our flow i.e. check the list of flows, the number of runs, the latest run, the list of steps, and the data artifact at each step. This is particularly helpful when debugging your flow. The error usually appears in this form.

![error](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_error.png)

Below, you can inspect your flow in this manner. This could be done through a Jupyter notebook or your CLI. We are using Jupyter notebook for this project.

![inspect](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_inspect0.png)

![inspect](/images/blog/metaflow-mnist-walkthrough/metaflow_mnist_inspect1.png)

So we covered understanding of Metaflow, its basic components, an example of a flow execution using the MNIST dataset, and inspecting data flow.

## References

- [GitHub — mnist-with-metaflow](https://github.com/ayotomiwasalau/mnist-with-metaflow)
