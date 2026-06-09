![](/images/project/forecasting-stock-prices-sarima-flask/stock-app-index.png)

A **Flask web app** for forecasting a stock’s **closing price** on a future date you choose. You supply a ticker symbol, a reference training window (start and end dates), and a prediction date; the app pulls daily history from **Quandl**, fits a **SARIMAX** model, and returns a point forecast with an interactive **Plotly** chart that compares observed closes against the projected path.

The build targets personal or professional financial analysis where an interpretable classical time-series method is preferable to a black-box model. It is a learning and demonstration project—not investment advice.

[GitHub — Stock_Prediction_Web_App](https://github.com/ayotomiwasalau/Stock_Prediction_Web_App) 

## Context

Historical prices are easy to chart, but a **dated point forecast** for a specific ticker requires a repeatable workflow. Spreadsheets and notebooks do not give analysts a shared interface for choosing a **reference training window**, fitting a time-series model, and viewing **reference vs forecast** on one chart.

## Approach

The [repo](https://github.com/ayotomiwasalau/Stock_Prediction_Web_App) packages ingest, modelling, and visualization as a small full-stack product—Flask forms in, Plotly chart out:

1. **Ingest** — pull daily closes from Quandl (`WIKI/{SYMBOL}`) for a user-defined date range
2. **Model** — fit **SARIMAX** on the reference window
3. **Predict** — forecast through the target date and return a rounded point estimate
4. **Visualize** — render reference and forecast traces with **Plotly** in `result.html`

| File / folder | Role |
|---|---|
| **`app.py`** | Flask routes, form args, Plotly JSON to templates |
| **`model.py`** | Quandl ingest, SARIMAX fit, predict, chart data |
| **`templates/`** | `index.html` (inputs), `result.html` (forecast + chart) |
| **`notebook/Stock_Prediction.ipynb`** | Exploratory order selection before app parameters |

## Architecture breakdown

HTTP stays thin in `app.py`; series logic lives in `Model` so the notebook and web app share the same SARIMAX path. Request flow and model parameters are detailed below.

### Request flow

1. User submits **company symbol**, **reference start/end dates**, and **prediction date** on `/index.html`
2. `/result.html` instantiates `Model()` and runs `extract_data` → `model_train` → `predict` → `plot_data`
3. The page shows the **rounded forecast** and an embedded Plotly graph

```python
arima = Model()
arima.extract_data(stock_symbol, start_date, end_date)
arima.model_train()
stock_predict = round(arima.predict(prediction_date)[1], 2)
graphJSON = json.dumps(arima.plot_data(), cls=plotly.utils.PlotlyJSONEncoder)
```

### Model (`model.py`)

| Step | Detail |
|---|---|
| Data | `quandl.get("WIKI/" + symbol)` → **Close** column as training series |
| Fit | `SARIMAX` with `order=(0,0,1)`, `seasonal_order=(1,1,1,12)`, `trend='n'` |
| Horizon | Days from last reference date to prediction date; `predict(..., dynamic=True)` |
| Chart | **Reference period** and **Forecast period** as Plotly `Scatter` traces |

![](/images/project/forecasting-stock-prices-sarima-flask/stock-app-results.png)

The results view overlays observed closes with the modelled path. A wide gap between traces usually means the reference window or SARIMAX orders need revision.

## Tech stack

Classical time-series tooling (statsmodels, Quandl) sits behind a server-rendered Flask UI—no separate frontend build or black-box forecast API.

| Layer | Tools |
|---|---|
| Backend | Python, Flask, Flask-Bootstrap |
| Modelling | `statsmodels` SARIMAX, pandas, numpy |
| Data | Quandl API (`WIKI/` dataset) |
| Frontend | HTML, CSS, JavaScript |
| Charts | Plotly (`Scatter`, JSON encoder in templates) |
| Exploration | Jupyter (`notebook/Stock_Prediction.ipynb`) |

## Design decisions

Four choices keep the app interpretable and easy to demo: explicit SARIMAX orders, user-chosen training windows, a thin HTTP layer, and server-rendered Plotly.

**SARIMAX over deep learning** — explicit orders that can be tuned in the notebook and explained to stakeholders.

**User-defined reference window** — the analyst chooses which historical regime to fit, not a fixed lookback.

**Thin Flask layer** — HTTP stays in `app.py`; series logic lives in `Model` for reuse from the notebook.

**Server-rendered Plotly** — interactive charts without a separate SPA.

## Impact

The app shows how a classical time-series model can ship as a shareable web product—not just a notebook chart—with explicit orders and a user-chosen training window.

- **End-to-end ML product** — ingest → SARIMAX → dated forecast → chart in one session
- **Interpretable method** — visible ARIMA/SARIMA orders instead of a black-box model
- **Visual validation** — reference and forecast traces expose poor fits quickly
- **Hosted demo** — [Heroku app](http://stockpredapp.herokuapp.com/) runs outside localhost

## Run locally

```bash
git clone https://github.com/ayotomiwasalau/Stock_Prediction_Web_App.git
cd Stock_Prediction_Web_App
pip install numpy pandas flask flask-bootstrap statsmodels plotly quandl requests matplotlib
python app.py
```

Configure a Quandl API key (via env, not hard-coded in source), then open `http://127.0.0.1:5000`.

## Links

Application source and notebook for order selection live in the repository; the Heroku demo runs the same Flask paths.

- [GitHub — Stock_Prediction_Web_App](https://github.com/ayotomiwasalau/Stock_Prediction_Web_App)
- [Live demo (Heroku)](http://stockpredapp.herokuapp.com/)
