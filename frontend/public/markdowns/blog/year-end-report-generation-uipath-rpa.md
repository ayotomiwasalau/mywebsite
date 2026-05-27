Year-end reporting is repetitive, rule-bound, and easy to get wrong under deadline pressure. An employee logs into a web portal each month, exports records, copies figures into Excel, sums columns, and formats a PDF — then repeats for twelve months before collating a final report. **Robotic Process Automation (RPA)** is a strong fit: the steps are deterministic, the UI is stable, and the time saved is immediate.

This walkthrough covers a **UIPath** solution that automates yearly report generation, documented in the open on [GitHub — Report-Generation---Process-Automation](https://github.com/ayotomiwasalau/Report-Generation---Process-Automation).

![](/images/blog/year-end-report-generation-uipath-rpa/report-output.png)

## The manual process

Before automation, the workflow looked like this:

1. Open the internal web portal
2. Download or copy **monthly records** one period at a time
3. Paste into Excel and **sum figures** across months
4. Produce the **year-end report** manually

![](/images/blog/year-end-report-generation-uipath-rpa/web-portal-scrape.png)

That pattern is slow, error-prone, and hard to audit. Any typo in a monthly export compounds into the final totals.

## Architecture: Dispatcher + Performer

The UIPath **Robotic Enterprise Framework (REFramework)** splits work into two bots:

### Dispatcher process bot

The **Dispatcher** reads monthly records from the web portal and enqueues each item on **UiPath Orchestrator** — the cloud control plane that schedules bots, holds queues, and tracks run history.

![](/images/blog/year-end-report-generation-uipath-rpa/dispatcher-bot.png)

![](/images/blog/year-end-report-generation-uipath-rpa/orchestrator-queue.png)

### Performer process bot

The **Performer** dequeues transactions one by one, applies business rules, aggregates figures, and writes the **year-end report** output. Failed items can be retried or flagged without blocking the whole batch.

![](/images/blog/year-end-report-generation-uipath-rpa/performer-process.png)

## Client hash workflow variant

The repo also includes a **Client Hash flow** workflow (`Workflow - Generate Yearly Report (Client Hash flow)`) for an alternate orchestration path when records are keyed by client hash. Same goal — collate monthly inputs into a single annual artifact — with different queue partitioning. See the repository folders and PDF walkthroughs for step-level detail.

## What you gain

> ##### **Speed** — a process that took hours of copy-paste runs unattended in minutes.\
> ##### **Consistency** — the robot applies the same summation and formatting rules every run.\
> ##### **Auditability** — Orchestrator logs which items were processed, succeeded, or failed.

The project README and bundled PDFs (`Generating Yearly Report.pdf`, `Generating yearly report sparse WTHR.pdf`) document the full REFramework states: Init → Get Transaction → Process → End.

## References

- [GitHub — Report-Generation---Process-Automation](https://github.com/ayotomiwasalau/Report-Generation---Process-Automation)
