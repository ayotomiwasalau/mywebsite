![](/images/blog/data-visualization-with-tableau/tableau-header.png)

## System overview

Pipelines, warehouses, and models only create value when someone can **see** the signal. **Data visualization** is the last mile: turning curated tables into dashboards that product, operations, and leadership use in weekly reviews. **Tableau** is one of the tools I use when the goal is **interactive exploration**, polished presentation, and fast iteration without standing up a custom front end.

This essay covers why visualization belongs in the analytics stack, how I work in Tableau day to day, design principles that keep dashboards trustworthy, and walkthroughs of two published workbooks on [Tableau Public — tomiwa.salau](https://public.tableau.com/app/profile/tomiwa.salau/vizzes).

## Why visualization matters after ETL and ML

After ETL, dbt transforms, or model scoring, the hardest question is often: *so what?* A well-built chart answers that faster than a CSV attachment. Strong visualizations surface outliers and seasonality, let non-technical teams filter by region or cohort without SQL, and anchor one source of truth for reviews.

At [Bravely](https://www.workbravely.com), I built **Tableau dashboards** on top of sentiment pipelines—**Airflow** plus **Hugging Face BERT** on coaching feedback. Models produced structured scores; Tableau made trends and segments legible to product teams. The split is deliberate: **compute in the pipeline, communicate in the viz layer**.

## Tableau Public as a portfolio surface

I maintain a public gallery on [Tableau Public](https://public.tableau.com/app/profile/tomiwa.salau/vizzes): workbooks you can open, filter, and share without Desktop licenses. Publishing publicly forces **clarity**—titles, legends, and filter defaults must make sense to a stranger. That discipline carries into internal dashboards where misread metrics are costly.

Below are writeups for two representative dashboards—retail profit by category and global asylum migration—showing how chart choice, hierarchy, and filters shape the story.

## Featured dashboard: profit across categories (Superstore)

![](/images/blog/data-visualization-with-tableau/office-assets.png)

**Workbook:** *Profit across categories* — a horizontal **stacked bar chart** titled *Profit per year across item categories*, with profit on the x-axis from roughly **-80K to 260K** and **year of order date** encoded by colour (2011 dark blue, 2012 orange, 2013 red, 2014 teal).

### What the chart shows

The view uses a **hierarchy**: three main categories (**Furniture**, **Office Supplies**, **Technology**), each broken into sub-categories on the y-axis. Stacked segments show how much profit each **year** contributed within that sub-category, so you can compare both **mix** (which lines sell) and **trend** (whether 2014 outperformed earlier years).

### Technology — highest overall profit

**Technology** drives the strongest results. **Copiers** is the top sub-category overall—total profit approaches **260K**, with a large **2014 (teal)** segment suggesting a strong recent year. **Phones** (~215K) and **Accessories** (~130K) follow. **Machines** contributes a smaller but still positive share (~60K). For a portfolio piece, this layout answers “where is margin concentrated?” in one glance.

### Furniture — winners and one clear loser

Within **Furniture**, **Bookcases** (~160K) and **Chairs** (~140K) are the standouts, with healthy stacks across years. **Furnishings** is modestly positive (~40K). **Tables** is the only sub-category in the entire view with bars extending **left of zero**—a **net loss** of about **-65K** across years. That single negative bar is the kind of detail a summary KPI would hide; the hierarchical bar chart makes it impossible to miss.

### Office Supplies — breadth, smaller slices

**Office Supplies** has the most sub-categories. **Appliances** (~140K) and **Storage** (~110K) lead; **Paper** and **Binders** sit in the middle (~45K–60K). Smaller lines—**Art**, **Envelopes**, **Fasteners**, **Labels**, **Supplies**—contribute only **10K–15K** each. The story here is **long tail**: many SKUs, few big profit drivers.

### Design choices in this view

- **Horizontal bars** fit long sub-category labels without rotation.
- **Stack by year** supports “did 2014 save this line?” without separate small multiples.
- **Sort within category** (implicit in layout) keeps related lines grouped for comparison.

**Takeaway:** Technology and top Furniture lines fund the business; **Tables** needs a pricing, returns, or assortment review.

## Featured dashboard: asylum seekers — source, movement, and period

![](/images/blog/data-visualization-with-tableau/migration-data.png)

**Workbook:** *Source, Movement, Period and Destination of Asylum Seekers across the world* — a multi-tab dashboard. The screenshot shows the tab **Number of Asylum Seekers by month per a given year**, with companion views for origin, destination, and migration flows elsewhere in the workbook.

### Layout and filters

Two **vertical bar charts** sit side by side, with a **Year of Date** radio filter (1999–2012, plus **All** selected in this view). A **colour legend** maps asylum seeker volume from low (green, ~316) to high (red, ~451K), supporting consistent encoding across tabs even where bars appear blue in this export.

### Chart 1 — Origin (left)

**Title:** *Origin*

- **X-axis:** countries of origin (alphabetical labels—Antigua and Barbuda, Belarus, Chad, Côte d'Ivoire, Ireland, Rwanda, Stateless, Uganda, and others).
- **Y-axis:** number of asylum seekers, scale **0–150K**.

**Read:** This chart answers **where applicants come from**. Bar heights vary sharply—some origins contribute very little volume, while others (e.g. **Ireland**, **Rwanda**, **Stateless** on the visible axis) show much higher counts. With **Year = All**, the view aggregates across the full period, highlighting structural source countries rather than a single year’s spike. For policy or NGO audiences, this is the “supply side” of migration pressure.

### Chart 2 — Month (right)

**Title:** *Month*

- **X-axis:** calendar months **January–December**.
- **Y-axis:** number of asylum seekers, scale **0–100K+** (peaks above 150K in September).

**Read:** This chart answers **when** volume clusters through the year. With all years selected, January opens around **110K**, spring months stay relatively flat, volume **rises from June**, and **September peaks** at over **150K** before easing toward year-end. That seasonality suggests reporting cycles, weather or conflict drivers, or administrative deadlines—worth cross-filtering by year to see if the September peak is stable or episodic.

### How the tabs work together

The navigation bar hints at a full story:

| Tab | Question it supports |
|---|---|
| Number of Asylum Seekers by month per a given year | Timing and seasonality (this screenshot) |
| Origin of Asylum seekers | Source countries |
| Destinations of Asylum seekers by year | Where people apply or relocate |
| Migration of asylum seekers | Movement patterns between regions |

**Year filter** ties every view to the same time window so origin and month charts stay comparable. **Takeaway:** asylum volume is **both geographically concentrated** and **calendar-shaped**; dashboards should expose both dimensions before drilling into destinations or flows.

### Design choices in this view

- **Paired charts** separate **who** (origin) from **when** (month) instead of overloading one axis.
- **Radio filters** make year selection obvious for non-technical users.
- **Shared colour scale** in the legend keeps magnitude comparable if colour is used on other tabs.

## End-to-end workflow

1. **Define the question** — “Are sentiment scores dropping for enterprise coaches in Q3?” beats “make a dashboard.”
2. **Connect** to the curated dataset—warehouse table, extract, or governed live connection when latency allows.
3. **Model** in Tableau: date hierarchies, calculated fields (YoY %, rolling averages), sensible aggregations (avoid double-counting semi-additive facts).
4. **Design** for the audience: fewer charts, consistent colour encoding, mobile-friendly layouts when executives read on phones.
5. **Publish** to Tableau Public, Server, or Cloud; embed links in Notion, Slack, or wiki pages.
6. **Iterate** from feedback—add parameters, dashboard actions, and tooltips as new questions appear.
7. **Align refresh** with upstream jobs (Airflow, dbt) so the viz layer does not outshine stale data.

## Dashboard design principles

> **Start with the question, not the chart type.** Trends over time → line or area. Part-to-whole → bar or treemap (use pie sparingly). Distribution → histogram or box plot. Relationship → scatter with size or colour for a third variable.

> **One primary insight per view.** Clutter trains users to ignore the board. Use **dashboard actions** to link summary to detail instead of cramming twelve charts above the fold.

> **Encode consistently.** Same colour for the same dimension across sheets; avoid rainbow scales on continuous metrics where a single-hue gradient reads better.

> **Label for export.** Screenshots circulate in slide decks; axis titles and units on KPI text prevent ambiguous metrics in meetings.

> **Document lineage and refresh.** Note data source, refresh schedule, and owner in subtitle or an “about this data” sheet.

> **Respect statistical honesty.** Default to zero baselines on bar charts unless there is a documented reason not to truncate.

## Tableau in the wider analytics stack

**Ingestion** → **warehouse** → **transform (dbt)** → **curated mart** → **Tableau**. When dbt tests fail, the dashboard should not refresh silently on bad data. For ML outputs, expose **model version and scoring date** as dimensions so users know which model pass they are viewing.

## Tool choice: Tableau vs alternatives

| Strength | Trade-off |
|---|---|
| Drag-and-drop speed for analysts | Licensing cost at scale vs open-source BI |
| Rich interactivity and stories | Heavy extracts vs live SQL need governance |
| Tableau Public for portfolio/demo | Not a replacement for embedded product analytics |

## Lessons from shipping internal dashboards

Stakeholders trust dashboards that match their vocabulary—aliases in Tableau should read like product language, not warehouse column names. I keep a **single landing dashboard** per domain and push detail to secondary tabs. On Tableau Public, each viz is a **teaching artifact**: filters pre-set to an interesting slice and a short data-source caption for context.

## Failure modes

- **Stale extracts** after a pipeline delay—mitigate with monitored refresh and visible “as of” timestamps.
- **Wrong grain joins** in Tableau or upstream SQL—validate row counts per dimension key.
- **Over-filtered defaults** that hide the problem you built the dashboard to catch.
- **Metric definitions drift** when calculated fields diverge from the warehouse.

## References

- [Tableau Public profile — tomiwa.salau](https://public.tableau.com/app/profile/tomiwa.salau/vizzes)
