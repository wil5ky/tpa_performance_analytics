# Global Treasury Operations Analytics Framework (Jira + Power BI)

## 1) Purpose
Create a practical analytics system that enables a global Treasury Operations function to:
- Run daily/weekly execution with predictable flow and controlled SLA risk.
- Monitor process health (speed, stability, quality) and target improvement opportunities.
- Support executive decisions on scaling, prioritization, and investment using trusted operational data.

This framework is designed to work directly off the current Power BI semantic model patterns:
- **Issue-grain fact**: `Issues`
- **Status transition history**: `Status History`
- **Calendar**: `Date` (+ holidays)
- **Process served** (multi-valued): `Components`
- **Work type / request taxonomy**: `Issues[Customer Request Type]`
- **SLA truth (primary)**: `Remaining Time in Status`
- **Urgency / “complexity” (primary)**: `Issues[Priority]` (plus weighted workload)

## 2) Context & Scope
### Operating context
- ~35–37K annual Jira requests.
- Corporate, shared-service model (supports multiple Business Units). **BU attribution is not required** for the core operating system.
- Core high-volume processes:
  - Unclaimed Property
  - Bank Administration
  - Employee Reimbursements & PCard
  - Accounts Payable (Treasury Ops touchpoints)
  - Tax

### Stakeholders & decisions
- **Process leaders**: daily tradeoffs, backlog control, root-cause targeting, standard work.
- **Director of Operations**: capacity planning, cross-process balancing, performance management.
- **Assistant Treasurer / Treasurer**: risk posture, scale strategy, investment prioritization, executive performance scorecards.

## 3) Measurement principles (what makes this work)
1. **One SLA truth**: use `Remaining Time in Status` as the authoritative SLA timing measure (normalized via the SLA duration divisor selector).
2. **One request = one row** for most operational KPIs (use `Issues` as the default grain).
3. **History for explanation**: use `Status History` to explain why flow changes (time-in-status, transitions, reopen patterns).
4. **Dual taxonomy (practical)**:
   - **Work type (primary)**: `Issues[Customer Request Type]` (what the customer asked for)
   - **Process served (secondary)**: `Components[Component]` (which operation(s) touched it)
5. **Avoid double counting with multi-valued tags** (`Components`, `Labels`):
   - For counts, prefer `Issues`-based counting unless you explicitly intend “issue-process pairs”.
6. **Capacity modeled from flow**: capacity is inferred from throughput + cycle time (Little’s Law) rather than time entry.

## 4) Standard operating layers
### Layer A — Operations (daily/weekly)
Goal: control workflow, backlog, and SLA risk in near real-time.

Key questions:
- Is intake outpacing throughput?
- Where is backlog building, and how old is it?
- What is at risk of breaching SLA, and what must be escalated today?

### Layer B — Performance Monitoring (weekly/monthly)
Goal: detect process health issues (speed, stability, quality) and drive improvement.

Key questions:
- Are we meeting SLAs consistently?
- Is cycle time improving, and is tail risk shrinking?
- Where is work waiting vs being worked?

### Layer C — Executive Decision Support (monthly/quarterly)
Goal: enable scaling decisions, portfolio prioritization, and value realization.

Key questions:
- What is our risk posture and operational resilience?
- Where should we invest to scale efficiently (automation, standardization, upstream fixes)?
- Are we getting more output per unit of capacity over time?

---

## 5) Model-aligned glossary (canonical definitions)
### 5.1 Request
A single Jira issue row in `Issues` (identified by `Issue ID` / `Issue Key`).

### 5.2 Open vs closed
- **Closed**: `Issues[Resolution Date]` is populated OR `Issues[Status Category] = "Complete"`.
- **Open (backlog/WIP)**: not closed.

### 5.3 SLA truth
Use `Remaining Time in Status` as the SLA truth measure.
- It is computed from `Issues[Remaining Time]` normalized by `Duration Units Selection_SLA[Selected Duration Divisor_SLA]`.
- Set the unit selector (hours/days) explicitly in your report standard.

### 5.4 Urgency / complexity
Primary driver: `Issues[Priority]`.
- For executive simplicity, also maintain a 3-tier grouping:
  - **Tier 3 (Highest urgency)**: Blocker / Critical / High
  - **Tier 2**: Major / Medium
  - **Tier 1**: everything else
- For workload-weighting, the model already uses `Weighted Workload Score` based on `Priority` values.

---

## 6) Metric catalog (buildable off the current model)
Each metric below includes: purpose, recommended grain, and typical owner.

### Layer A — Operations (daily/weekly)
1) **Created Requests**
- Purpose: monitor demand (intake).
- Grain: day/week, by work type (`Customer Request Type`) and process served (`Component`).
- Owner: Director of Ops / process leaders.

2) **Resolved Requests**
- Purpose: monitor delivery (throughput).
- Grain: day/week, by work type and process served.
- Owner: Director of Ops.

3) **Backlog / WIP**
- Purpose: current open inventory; leading indicator of delay.
- Grain: daily snapshot; slice by status category and process.
- Owner: process leaders.

4) **Net Flow (Created − Resolved)**
- Purpose: early signal of overload.
- Grain: weekly; slice by work type and process.
- Owner: Director of Ops.

5) **SLA Risk Mix (On-track / At-risk / Breached)**
- Purpose: prioritize today’s work to protect SLA.
- Primary basis: `Remaining Time in Status`.
- Grain: daily; slice by process/work type.
- Owner: process leaders.

6) **At-Risk WIP (count)**
- Purpose: “what must be saved” today.
- Use existing measure: `At Risk WIP` (already implemented off remaining time thresholds).
- Grain: daily; slice by work type, priority, status category.
- Owner: team leads.

7) **Aging (open inventory age)**
- Purpose: identify stuck work and tail build-up.
- Implementation note: if a full bucket set does not exist, add bucket measures (0–2, 3–7, 8–14, 15–30, 30+ days) based on open issues.
- Grain: daily/weekly; slice by process/work type.
- Owner: process leaders.

8) **Workload Index (Priority-weighted)**
- Purpose: compare workload across weeks even when mix shifts.
- Use existing measure: `Weighted Workload Score`.
- Grain: week; slice by process/work type.
- Owner: Director of Ops.

### Layer B — Performance Monitoring (weekly/monthly)
1) **SLA Compliance Rate**
- Purpose: core service commitment indicator.
- Use: `SLA Compliance Rate`.
- Grain: weekly/monthly.
- Owner: process leaders.

2) **SLA Coverage Rate**
- Purpose: data quality and measurement completeness.
- Use: `SLA Coverage Rate` and blank SLA counts.
- Owner: ops excellence / reporting owner.

3) **Cycle Time (Avg + tail)**
- Purpose: end-to-end speed and predictability.
- Use: `Cycle Time Issue Avg` plus add P90 where available/desired.
- Grain: monthly by request type and priority.
- Owner: process leaders.

4) **WIP Age (Avg Days)**
- Purpose: detect growing tail before it becomes breaches.
- Use: `WIP Age (Avg Days)`.
- Grain: weekly/monthly.
- Owner: Director of Ops.

5) **Time in Status / Waiting vs Working**
- Purpose: identify bottlenecks (approval waits, customer waits, bank waits).
- Use: `Time in Status` (elapsed time normalized) and supporting status-duration measures.
- Grain: monthly by from/to status category.
- Owner: process leaders.

6) **Reopen Rate**
- Purpose: quality proxy and rework detection.
- Use: `Reopen Rate` + consider adding reopen event counts.
- Grain: monthly by request type/process.
- Owner: process leaders.

7) **Avg Status Transitions**
- Purpose: workflow friction proxy (handoffs *within statuses*).
- Use: `Avg Status Transitions`.
- Grain: monthly by request type.
- Owner: ops excellence.

8) **Customer feedback signals (if applicable)**
- Purpose: customer experience guardrail.
- Use: satisfaction measures already present.
- Grain: monthly.
- Owner: Director of Ops.

### Layer C — Executive Decision Support (monthly/quarterly)
1) **Demand & Mix (Request Type / Process Served)**
- Purpose: understand where scale pressure is.
- Grain: quarterly; show top request types and process components.
- Owner: Director of Ops.

2) **Tail Risk Score (P90 cycle time + aging + breaches)**
- Purpose: highlight operational risk and backlog fragility.
- Grain: monthly/quarterly.
- Owner: Asst Treasurer.

3) **Scaling Metric: Capacity efficiency (flow-based)**
- Purpose: show output vs implied capacity.
- Approach: use throughput and cycle time trends; optionally infer implied WIP targets.
- Owner: Treasurer.

4) **Days to Clear Backlog**
- Purpose: “how long to recover if intake stopped.”
- Use existing measure: `Days to Clear Backlog`.
- Owner: Treasurer.

5) **Investment prioritization pipeline**
- Purpose: tie improvement initiatives to measurable outcomes.
- Method: prioritize by expected impact on SLA risk mix, cycle time tail, and workload index.
- Owner: Treasurer / Director of Ops.

6) **Workload-weighted throughput trend**
- Purpose: avoid the “easy ticket” bias.
- Use: `Weighted Workload Score` alongside `Resolved Requests`.
- Owner: Director of Ops.

---

## 7) Dashboard design (what to build)
### Page 1 — Operations Control Tower (Daily/Weekly)
- Created vs Resolved trend
- Backlog and status category mix
- SLA risk mix (on-track / at-risk / breached)
- Top aging cohorts (30+ days + full bucket bars)
- Drill to issue list

### Page 2 — SLA Risk & Recovery
- At Risk WIP (trend + table)
- Out of SLA (trend)
- Remaining Time in Status distribution for open issues
- Drill: process served → request type → priority → issues

### Page 3 — Flow & Stability
- Cycle Time Issue Avg (trend)
- WIP Age (Avg Days)
- Avg Status Transitions
- Time in Status breakdown (where work waits)

### Page 4 — Quality & Rework
- Reopen Rate (trend)
- Reopen counts (if added)
- CSAT metrics (if in-scope)
- Root-cause proxy views (if a root cause field is introduced later)

### Page 5 — Executive Scorecard
- SLA Compliance Rate + Tail Risk Score
- Days to Clear Backlog
- Demand & mix (top request types / components)
- Workload index and workload-weighted throughput
- Initiative portfolio (see Section 9)

---

## 8) Governance & cadence (operating model)
### Daily (15 min) — Process leaders
- Backlog/WIP and SLA risk mix review
- At-risk list: top items to triage and escalate
- Agree today’s priorities by `Priority` + SLA remaining time

### Weekly (45–60 min) — Director of Ops + process leads
- Created vs resolved by request type / component
- Backlog change and aging bucket movement
- SLA compliance and drivers (which statuses or request types)

### Monthly (60–90 min) — Ops excellence + leadership
- Cycle time trend + tail review
- Reopen rate + workflow friction (status transitions)
- Improvement action tracking (what moved which metric)

### Quarterly — Executive steering
- Scale & resilience scorecard
- Investment prioritization and roadmap

---

## 9) Executive decision support: initiative prioritization rubric
Use a simple scoring model for improvements (automation, standardization, upstream fixes):
- **Impact**: expected reduction in breached/at-risk mix, cycle time tail, and backlog days
- **Confidence**: quality of evidence (data volume, repeatability)
- **Effort**: delivery effort (tech + process change)
- **Risk reduction**: compliance/financial risk improvement

Recommended output: a ranked list of initiatives with a single metric target each (e.g., “reduce at-risk WIP by 20% within 2 quarters”).

---

## 10) Known model constraints (and how we handle them)
1) **No BU attribution fields** exist in the semantic model.
- This framework is designed to operate without BU slicing.
- If BU slicing becomes necessary later, add a reference mapping from `Project Key` / `Customer Request Type` to BU.

2) **Assignee history is not present** (only current assignee snapshot).
- Metrics like handoffs, time-with-assignee, and ping-pong require changelog ingestion (next section).

3) **Multi-valued tags (`Components`, `Labels`) can cause double counting**.
- Use them intentionally (issue-process pairs) and document which views are “issue counts” vs “tagged counts”.

---

## 11) Jira changelog / assignee-history enhancement plan (to unlock handoffs)
### Goal
Enable accurate metrics for:
- Handoff count per issue
- Time with each assignee
- Reassignment/ping-pong patterns
- Project/queue movement count and time (if queue is represented as a field)

### Source requirements (Jira)
Extract issue changelog (field history), at minimum for:
- `assignee` changes
- `status` changes (optional; cross-check with existing `Status History`)
- `project` changes (if issues move projects)
- Any queue/team field if it exists as a custom field

Recommended Jira API (Cloud):
- `GET /rest/api/3/issue/{issueIdOrKey}/changelog` (paged)

### Pipeline options
A) **Incremental polling (most common)**
- Find issues updated since last watermark, then fetch changelog pages.
- Pros: no webhook infra.
- Cons: rate limit management; backfill needs batching.

B) **Webhook-driven + reconciliation**
- Capture updates via webhooks, fetch changelog for changed issues.
- Pros: lower latency.
- Cons: needs secure endpoint + replay handling.

C) **Enterprise connector / data lake export**
- If you have a sanctioned connector that already exposes changelog tables.
- Pros: easiest at scale.
- Cons: depends on licensing/availability.

### Target model additions (semantic)
Add two new tables (pattern matches the existing `Status History` approach):

1) **Issue Field History** (event fact)
- Grain: one row per `(Issue ID, History ID, Field Name)` change.
- Columns: Issue ID, History ID, Change Timestamp/Date, Field Name, From Value, To Value, Changed By (ID), Ingested At.
- Relationships: Many-to-One to `Issues` on Issue ID; Many-to-One to `Date` on Change Date.

2) **Assignee Segments** (derived fact)
- Grain: continuous ownership period per issue.
- Columns: Issue ID, Assignee ID, Segment Start/End, Duration, Segment Index, Current Flag.
- Relationships: Many-to-One to `Issues`; Many-to-One to `Date` (start date; end date optional inactive).

### Measures enabled (examples)
- **Handoff Count**: count of `assignee` change events.
- **Time With Assignee**: sum of `Assignee Segments[Duration]`.
- **Ping-Pong Rate**: issues where sequence returns to a previous assignee within N days.
- **Queue/Project Moves**: count and duration by project/queue segments (if captured).

### Data quality & privacy
- Join on Jira `accountId` (stable) rather than email.
- Define whether null→person transitions count as “handoffs.”
- Keep a sliding reprocess window (e.g., last 14 days) to capture late-arriving edits.

---

## 12) Implementation sequencing (recommended)
1) **Phase 1 (2–4 weeks): Operations layer hardening**
- Standardize SLA unit selection, definitions, and drill paths.
- Add aging buckets if missing.

2) **Phase 2 (4–8 weeks): Performance monitoring maturity**
- Stabilize cycle time/tail views, time-in-status analysis, reopen event counts.

3) **Phase 3 (8–12+ weeks): Assignee-history enhancement + advanced flow**
- Ingest changelog, add assignee segments, build handoff and time-with-assignee metrics.

4) **Phase 4: Executive portfolio system**
- Tie initiatives to metric targets and track realized impact.

---

## 13) Appendix — Metric Dictionary (One-Page)
Use this as the standard reference for operational reviews. Source fields/measures reflect the current Power BI semantic model.

| Layer | Metric | Owner | Default grain | Definition (operational) | Source (model) | Notes |
|---|---|---|---|---|---|---|
| Operations | Created Requests | Director of Ops | Day / Week | Count of requests created in period | Measure: `FW - Created Requests` | Uses Created Date role (`Issues[Created Date]` → `Date[Date]`) |
| Operations | Resolved Requests | Director of Ops | Day / Week | Count of requests resolved in period | Measure: `FW - Resolved Requests` | Uses Resolution Date role via `USERELATIONSHIP` |
| Operations | Backlog / WIP | Process Leaders | Daily snapshot | Open inventory (work in progress) | Measure: `WIP (Work in Progress)` | Prefer status-category logic vs status text where possible |
| Operations | Net Flow | Director of Ops | Week | Intake minus throughput | Measure: `FW - Net Flow (Created - Resolved)` | Positive = backlog pressure; negative = recovery |
| Operations | Remaining Time in Status (SLA truth) | Process Leaders | Daily | Remaining SLA time normalized to selected unit | Measure: `Remaining Time in Status` | Uses divisor helper `Selected Duration Divisor_SLA` |
| Operations | At-Risk WIP | Team Leads | Daily | Open items with low remaining time (thresholded) | Measure: `At Risk WIP` | Thresholds currently based on remaining time logic |
| Operations | Within SLA / Out of SLA (counts) | Team Leads | Daily / Week | Counts of issues within/out of SLA | Measures: `Issues Within SLA Count`, `Issues Out of SLA Count` | Standardize display labels and filters |
| Operations | SLA Risk Mix (On-track / At-risk / Breached) | Process Leaders | Daily | Distribution of open inventory across SLA risk states | Measures: `FW - On Track WIP (> 1 unit)`, `FW - At Risk WIP (<= 1 unit)`, `FW - Breached WIP` | Risk thresholds use selected SLA units (via `Selected Duration Divisor_SLA`) |
| Operations | SLA Risk Mix % | Process Leaders | Daily | Percent split of SLA-covered open inventory across risk states | Measures: `FW - SLA Risk Mix % (On Track)`, `FW - SLA Risk Mix % (At Risk)`, `FW - SLA Risk Mix % (Breached)` | Denominator is `FW - Open Issues (SLA Covered)` |
| Operations | Aging Buckets (0–2, 3–7, 8–14, 15–30, 30+) | Process Leaders | Daily | Open items bucketed by age since created | Measures: `FW - Aging Open 0-2 Days`, `FW - Aging Open 3-7 Days`, `FW - Aging Open 8-14 Days`, `FW - Aging Open 15-30 Days`, `FW - Aging Open 30+ Days` | Uses Created Date vs `TODAY()` (as-of-today aging) |
| Operations | Workload Index (Priority-weighted) | Director of Ops | Week | Priority-weighted workload score for mix-adjusted workload | Measure: `Weighted Workload Score` | Weights based on `Issues[Priority]` |
| Performance | SLA Compliance Rate | Process Leaders | Week / Month | % resolved within SLA | Measure: `SLA Compliance Rate` | Pair with SLA Coverage Rate |
| Performance | SLA Coverage Rate | Ops Excellence | Week / Month | % of issues with non-blank SLA data | Measure: `SLA Coverage Rate` | Monitor data completeness (`Blank SLA` measures) |
| Performance | Cycle Time (Avg) | Process Leaders | Month | Avg end-to-end time created → resolved | Measure: `FW - Cycle Time Issue Avg` | Add P90 later if needed |
| Performance | WIP Age (Avg Days) | Director of Ops | Week / Month | Average age of open inventory | Measure: `WIP Age (Avg Days)` | Leading indicator for tail risk |
| Performance | Time in Status | Process Leaders | Month | Elapsed time normalized to selected unit | Measure: `Time in Status` | Slice by status categories to find waits |
| Performance | Avg Status Transitions | Ops Excellence | Month | Avg count of status changes per request | Measure: `Avg Status Transitions` | Proxy for workflow friction |
| Performance | Reopen Rate | Process Leaders | Month | % of issues reopened after completion | Measure: `FW - Reopen Rate` | Pair with reopen events for context |
| Performance | Reopen Events / Reopened Issues | Process Leaders | Month | Count of reopen transitions and impacted issues | Measures: `FW - Reopen Events (by Transition Date)`, `FW - Reopened Issues (by Transition Date)` | Uses transition datetime role to `Date` via `USERELATIONSHIP` |
| Performance | Customer Satisfaction (if used) | Director of Ops | Month | Avg satisfaction and response rate | Measures: `Avg Satisfaction Rating`, `Satisfaction Response Rate` | Use as guardrail, not a throughput target |
| Executive | High Priority % | Treasurer | Month / Quarter | % of volume in highest urgency priorities | Measure: `FW - High Priority %` | Tiering also available as column `Issues[FW - Priority Tier]` |
| Executive | Avg Issue Complexity | Treasurer | Month / Quarter | Avg priority-weighted complexity score per request | Measure: `Avg Issue Complexity` | Derived from `Weighted Workload Score / Issue Count` |
| Executive | Days to Clear Backlog | Treasurer | Week / Month | Estimated days to clear open inventory at current throughput | Measure: `FW - Days to Clear Backlog` | Key resilience metric |
| Executive | Workload-weighted throughput | Director of Ops | Month / Quarter | Throughput adjusted for workload mix | Measure: `FW - Resolved Workload Score` | Uses Resolution Date role; pair with `FW - Workload per Resolved Issue` |
| Executive | Tail Risk Components | Asst Treasurer | Month / Quarter | Components used to discuss operational risk | Measures: `FW - Breach Share of Open (SLA Covered)`, `FW - Aging 30+ Share of Open`, `FW - Cycle Time Issue Avg` | Prefer components over a single opaque score |

