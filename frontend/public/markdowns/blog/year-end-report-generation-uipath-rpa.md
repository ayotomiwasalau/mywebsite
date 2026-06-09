![](/images/blog/year-end-report-generation-uipath-rpa/report-output.png)

## System overview

Year-end reporting is repetitive, rule-bound, and painful under deadline pressure. An employee opens a web portal each month, exports records, pastes figures into Excel, sums columns, formats a PDF, and repeats twelve times before collating an annual summary. The steps are deterministic, the UI is stable, and mistakes compound—one wrong monthly paste skews the whole year.

**Robotic Process Automation (RPA)** fits that profile. This post documents a **UiPath** solution that automates yearly report generation using the **Robotic Enterprise Framework (REFramework)**, a **Dispatcher + Performer** split, and **UiPath Orchestrator** for queues and audit trails. Source and PDF walkthroughs: [GitHub — Report-Generation---Process-Automation](https://github.com/ayotomiwasalau/Report-Generation---Process-Automation).

## The manual process (baseline)

Before automation:

1. Open the internal **web portal**
2. Download or copy **monthly records** one period at a time
3. Paste into Excel and **sum figures** across months
4. Produce the **year-end report** manually


That pattern is slow, error-prone, and weak on audit: there is no central log of which months were processed, retried, or skipped. RPA does not remove the business rules—it **executes them the same way every run** and records outcomes in Orchestrator.

## REFramework: the state machine every bot shares

REFramework is UiPath’s standard template for transactional bots. Both Dispatcher and Performer follow the same high-level states (names vary slightly by template version):

| State | Purpose |
|---|---|
| **Init** | Load config, open applications, authenticate, read settings from `Config.xlsx` |
| **Get Transaction Data** | Pull the next queue item (Performer) or enqueue work (Dispatcher) |
| **Process Transaction** | Apply business rules to one unit of work |
| **End Process** | Close apps, log summary, hand off to Orchestrator |

**Init** failures should stop the job early—bad credentials or missing config should not dequeue hundreds of items. **Process** failures mark the transaction **Failed** or **Retry** depending on business exception vs system exception (network timeout, selector not found).

The repository README and bundled PDFs (`Generating Yearly Report.pdf`, `Generating yearly report sparse WTHR.pdf`) map each screen and activity to these states—useful when onboarding another developer to the same pattern.

## Architecture: Dispatcher + Performer

Splitting work across two processes is the standard scale pattern for REFramework:

### Dispatcher process bot

The **Dispatcher** reads monthly records from the web portal (UI automation or structured export), builds **queue items**—one transaction per month or per client slice—and uploads them to **UiPath Orchestrator**. The Dispatcher does not perform heavy aggregation; it **feeds the queue** reliably.

Responsibilities:

- Navigate portal pages and download/copy monthly data
- Populate **QueueItem** payloads (client ID, period, file paths, hash keys)
- Set **priority** and **reference** fields for traceability
- Handle “no more data” by transitioning to End Process

### Performer process bot

The **Performer** dequeues transactions one at a time, applies **business rules** (summation, formatting, validation), and writes the **year-end report** artifact. Failed items can be **retried** or left in **Failed** without blocking the whole year—operations clears the exception queue separately.

Responsibilities:

- **Get Transaction Data** from Orchestrator
- Open Excel or report template; paste or import monthly figures
- Validate totals against business rules
- Export PDF/Excel output and mark item **Successful**
- On business rule violation → **Business Exception** (often no retry)
- On transient UI issue → **System Exception** → retry with backoff

## UiPath Orchestrator’s role

Orchestrator is the **control plane**:

- **Queues** — transactional worklists shared by many Performer robots
- **Schedules** — run Dispatcher nightly, Performer farm during windows
- **Logs and screenshots** — audit who processed which month
- **Assets** — credentials and config values without hard-coding secrets in `.xaml`
- **Triggers** — chain Dispatcher completion to Performer start

![](/images/blog/year-end-report-generation-uipath-rpa/uipath-orch.png)

For year-end reporting, the queue is the **backbone**: Dispatcher production rate and Performer consumption rate can scale independently (more Performer machines at month-end).

## Client Hash workflow variant

The repo includes **Workflow — Generate Yearly Report (Client Hash flow)** for records keyed by **client hash** instead of a single global queue. Same outcome—collate monthly inputs into one annual artifact—with **partitioned queue items** so parallel Performers do not stomp the same client file. See repository folders for the alternate `.xaml` entry points and sparse WTHR PDF for step-level selectors.

## Design decisions

**REFramework over ad hoc sequences** — State machine + config drive consistency; new hires recognize Init/Get/Process/End across projects.

**Dispatcher/Performer split** — Decouples “scrape the portal” from “build the report,” so you can re-run Performer on a fixed queue after fixing Excel logic without re-scraping twelve months.

**Orchestrator queues** — Built-in retry, analytics, and multi-bot scaling; Excel macros alone cannot offer that operational surface.

**UI automation risk** — Selectors break when the portal changes; mitigate with dynamic anchors, wait conditions, and versioned portal test accounts.

## What you gain

> **Speed** — hours of copy-paste collapse to unattended minutes once the queue is loaded.

> **Consistency** — summation and formatting rules apply identically every transaction.

> **Auditability** — Orchestrator shows processed, successful, and failed items with timestamps.

> **Resilience** — retry failed months without rerunning the entire year manually.

## Trade-offs

| Pros | Cons |
|---|---|
| Fast ROI on stable, rules-based UIs | Brittle to portal redesigns |
| Low-code for business-adjacent developers | Not ideal for high-volume API-first integrations (prefer direct API ETL) |
| Orchestrator ops visibility | Licensing and robot infrastructure cost |
| REFramework standardization | Initial template weight for tiny one-step tasks |

## Operational checklist

Before promoting Dispatcher and Performer to production schedules:

- **Test data** — run against a sandbox portal tenant so queue items do not touch production figures
- **Selector audit** — document each UI element with stable `aaname` / `css` anchors; retest after portal releases
- **Exception taxonomy** — separate business rules (bad month total) from system faults (timeout) in Orchestrator analytics
- **Credential rotation** — store portal passwords in Orchestrator **Assets**, not in source-controlled `.xaml` files

These steps are boring and save the year-end weekend when the portal ships a minor layout change.

## When API beats RPA

If the portal exposes a **documented API** or bulk export, prefer scheduled Python or Airflow jobs writing to the warehouse. Use RPA when **only the UI exists** or API access is blocked—exactly the year-end portal scenario this project models.

## References

- [GitHub — Report-Generation---Process-Automation](https://github.com/ayotomiwasalau/Report-Generation---Process-Automation)
- [UiPath REFramework documentation](https://docs.uipath.com/)
