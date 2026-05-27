![](/images/project/forecasting-stock-prices-sarima-flask/stock-app-index.png)

Financial analysts often need a forward view of price movement — not just historical charts. This project is a **web app for forecasting stock prices** from daily closing history, built for practical use (professional or personal) to support analysis and investment planning.

## Problem

Raw historical prices are easy to plot but hard to turn into a **dated forecast** without standing up a modelling workflow. Spreadsheets break down when you want:

- A repeatable forecast for a **specific future date**
- A **time-series model** that respects seasonality in market data
- An interactive UI analysts can use without running notebooks locally

The goal was a simple, deployable tool: enter a ticker and target date, get a forecast backed by a proper statistical model — not a black-box guess.

## Solution

Build a **Flask** web application that:

1. Pulls historical stock data (via Quandl in the original implementation)
2. Fits a **SARIMA** (Seasonal Autoregressive Integrated Moving Average) model on daily closes
3. Returns a forecast for the requested date
4. Renders results with **Plotly** interactive charts in the browser

The stack keeps the backend in Python, the UI in HTML/CSS/JavaScript templates, and charting in Plotly — a small full-stack ML product rather than a notebook-only experiment.

![](/images/project/forecasting-stock-prices-sarima-flask/stock-app-results.png)

## Architecture breakdown

### Data

Historical daily closing prices feed the model. The training window comes from past observations; the user specifies the company and the forecast date through the web form.

### Modelling

**SARIMA** captures autoregressive structure, differencing, moving-average terms, and seasonality — a standard approach for univariate financial time series when you want interpretable classical forecasting (as opposed to deep learning).

Core libraries:

- `statsmodels.tsa.statespace.sarimax` — model fitting and prediction
- `pandas` / `numpy` — series handling and offsets (e.g. `DateOffset` for horizon steps)

### Application layer

- **`app.py`** — Flask routes, form handling, serves predictions to the UI
- **`model.py`** — training and inference logic separated from HTTP concerns
- **`templates/`** — server-rendered pages for input and results
- **`static/`** — front-end assets

### Visualization

**Plotly** (`plotly.graph_objs.Scatter`) plots historical series and forecast output so users can inspect the fit visually in the browser.

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Python, Flask |
| Modelling | SARIMA (statsmodels), pandas, numpy |
| Data | Quandl API (historical prices) |
| Frontend | HTML, CSS, JavaScript |
| Charts | Plotly |
| Exploration | Jupyter notebook (`notebook/`) for model development |

## Impact

- **End-to-end ML product** — from historical data to dated forecast in a browser
- **Interpretable model** — SARIMA suitable for analysts who want classical time-series methods
- **Interactive output** — Plotly charts for quick visual validation
- **Deployable app** — Flask server pattern documented for local and hosted runs

## Run locally

1. Clone the [GitHub repository](https://github.com/ayotomiwasalau/Stock_Prediction_Web_App)
2. Install dependencies (`numpy`, `pandas`, `flask`, `statsmodels`, `plotly`, `quandl`, etc.)
3. Run `app.py` to start the Flask server
4. Open the app in your browser and submit a ticker + forecast date

## Links

- [GitHub — Stock_Prediction_Web_App](https://github.com/ayotomiwasalau/Stock_Prediction_Web_App)
- [Live demo (Heroku)](http://stockpredapp.herokuapp.com/)
