Raw data only becomes useful when people can see patterns, compare trends, and act on insights quickly. **Data visualization** is the layer that turns warehouse tables and pipeline outputs into dashboards stakeholders actually use — and **Tableau** is one of the tools I reach for when the goal is interactive exploration, polished presentation, and fast iteration.

![](/images/blog/data-visualization-with-tableau/dashboard-hero.webp)

## Why visualization matters

After ETL, modelling, or ML scoring, the hardest question is often: *so what?* A well-built chart answers that faster than a spreadsheet export. Good visualizations:

— Surface outliers and seasonality at a glance

— Let non-technical teams filter by region, product, or time period

— Anchor weekly reviews and executive summaries on a single source of truth

At [Bravely](https://www.workbravely.com), I built **Tableau dashboards** on top of sentiment-analysis pipelines (Airflow + Hugging Face BERT on unstructured feedback). The models produced structured scores; Tableau made those scores legible to product and coaching teams — supporting insights with roughly **98% accuracy** on labelled evaluation sets.

## What I publish on Tableau Public

I maintain a public portfolio of workbooks and dashboards on [Tableau Public — tomiwa.salau](https://public.tableau.com/app/profile/tomiwa.salau/vizzes). That profile is the live gallery: interactive vizzes you can open, filter, and share without installing desktop software.

![](/images/blog/data-visualization-with-tableau/charts-overview.webp)

Typical themes in the portfolio:

- **Exploratory dashboards** — bar, line, and scatter views for comparing categories over time
- **KPI cards and trend lines** — headline metrics with drill-down detail
- **Story-style layouts** — guiding a viewer from context → finding → recommendation

Browse the full collection on [Tableau Public](https://public.tableau.com/app/profile/tomiwa.salau/vizzes).

## A practical workflow

1. **Connect** to the curated dataset (warehouse table, CSV extract, or live connection where appropriate)
2. **Model** dimensions and measures — date hierarchies, calculated fields, aggregations
3. **Design** for the audience: fewer charts, clearer labels, consistent colour encoding
4. **Publish** to Tableau Public or Server so links can be embedded in docs, Slack, or internal wikis
5. **Iterate** from feedback — add filters, tooltips, and parameters as questions evolve

![](/images/blog/data-visualization-with-tableau/kpi-dashboard.webp)

## Design principles I follow

> ##### Start with the question, not the chart type. Pick visuals that match the comparison you need — trend over time (line), part-to-whole (bar/stacked bar), distribution (histogram/box), relationship (scatter).

> ##### Keep dashboards focused. One primary metric per view; use dashboard actions to link detail without cluttering the landing page.

> ##### Document data lineage. A beautiful viz on stale data erodes trust — tie refresh schedules to your Airflow or dbt jobs where possible.

Tableau sits at the end of a longer analytics stack (ingestion → warehouse → transform → viz). The visualization layer is where pipeline work pays off for business users.

## References

- [Tableau Public profile — tomiwa.salau](https://public.tableau.com/app/profile/tomiwa.salau/vizzes)
