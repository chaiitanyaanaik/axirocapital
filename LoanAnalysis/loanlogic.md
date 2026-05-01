# MSME Loan Insight Engine

## Overview

This system is a deterministic, multi-stage diagnostic engine that helps MSMEs understand issues in business loans using minimal input.

### 3-Gate Flow

| Gate | Purpose |
|---|---|
| Gate 1 | Detect signals and generate initial insight |
| Gate 2 | Identify root cause (why) |
| Gate 3 | Qualify action (what next) |

### Design Principles

- Minimal input, maximum insight
- One question at a time
- Deterministic flow (no random decision logic)
- Avoid form-like experience
- AI only for language/parsing, not control logic

## 1) Gate 1 Inputs

These are the only upfront questions.

```json
{
  "revenue_band": ["<25L", "25L-1Cr", "1-5Cr", "5Cr+"],
  "business_age": ["<1yr", "1-3yr", "3+yr"],
  "loan_status": ["no_loan", "bank", "nbfc", "multiple"],
  "interest_band": ["<12%", "12-16%", "16-22%", "not_sure"],
  "cashflow": ["stable", "sometimes_tight", "frequently_tight"],
  "gst_trend": ["stable", "seasonal", "declining"],
  "recent_loan_experience": ["no", "approved", "rejected"]
}
```

### UI Labeling Note (Current Frontend)

- Frontend may display friendlier labels for these fields/options.
- Runtime scoring must continue using canonical keys and canonical values shown above.
- Label changes must not alter:
  - `Gate1Key` names
  - canonical enum values
  - scoring rule string matches
- `business_change` is not in current Gate 1 scoring and should be treated as optional metadata only.

## 2) Scenarios (Reference Design)

These are the internal diagnostic conditions in the target design.

```json
{
  "S1": "High interest with stable GST",
  "S2": "Loan rejected recently",
  "S3": "Wrong loan usage (term vs working capital)",
  "S4": "Low credit limit vs revenue",
  "S5": "Unsecured loan despite strong profile",
  "S6": "Multiple small loans",
  "S7": "Frequent cash flow dips",
  "S8": "GST vs banking mismatch",
  "S9": "New business",
  "S10": "Seasonal business",
  "S11": "Already low interest",
  "S12": "High EMI pressure",
  "S13": "Urgency-based borrowing",
  "S14": "Informal borrowing",
  "S15": "Growth without limit increase",
  "S16": "High receivables cycle",
  "S17": "High inventory holding",
  "S18": "Frequent loan switching",
  "S19": "NBFC dependency",
  "S20": "Documentation issues",
  "S21": "Mixed personal/business accounts",
  "S22": "Low profit visibility",
  "S23": "Recent GST drop",
  "S24": "Multiple rejections",
  "S25": "First-time borrower",
  "S26": "Customer concentration",
  "S27": "Underreported GST",
  "S28": "Inefficient small loan",
  "S29": "OD/CC underutilized",
  "S30": "Broker-led loan decision"
}
```

## 3) Scenario Clusters

Clusters simplify scoring and question routing.

```json
{
  "pricing": ["S1", "S5", "S19", "S28"],
  "cashflow": ["S7", "S12", "S16", "S10"],
  "credit_access": ["S2", "S20", "S24"],
  "structure": ["S3", "S29"],
  "growth": ["S4", "S15"],
  "informal": ["S14", "S25", "S27"],
  "behavior": ["S13", "S18", "S30"],
  "financial_clarity": ["S22"],
  "dependency": ["S26"],
  "inventory": ["S17"]
}
```

### Implementation Status (current code)

- Scores are currently calculated only for:
  - `pricing`: `S1`, `S5`, `S19` (`S28` not implemented)
  - `cashflow`: `S7`, `S12` (`S16`, `S10` not implemented)
  - `credit_access`: `S2` (`S20`, `S24` not implemented)
  - `growth`: `S4` (`S15` not implemented)
  - `informal`: `S14`, `S25` (`S27` not implemented)
- Not implemented/scored yet:
  - `structure` (`S3`, `S29`)
  - `behavior` (`S13`, `S18`, `S30`)
  - `financial_clarity` (`S22`)
  - `dependency` (`S26`)
  - `inventory` (`S17`)

## 4) Question Types (Core System Design)

Question definitions intended for Gate 2 and Gate 3.

```json
{
  "Q1_collateral": "Is your loan secured or unsecured?",
  "Q2_loan_usage": "How are you using this loan — working capital or one-time?",
  "Q3_receivables": "Do customers take long to pay you?",
  "Q4_growth": "Has your revenue grown significantly recently?",
  "Q5_financials": "Are your financials audited or self-prepared?",
  "Q6_behavior": "Did you compare lenders before taking this loan?",
  "Q7_informality": "Do you use informal borrowing or cash-heavy transactions?",
  "Q8_dependency": "Does one customer contribute a large share of revenue?",
  "Q9_inventory": "How long does inventory stay unsold?",
  "Q10_loan_size": "What is your loan size relative to your needs?"
}
```

### Gate 2 Questions in Current Implementation

- Gate 2 currently asks only:
  - `Q1_collateral`
  - `Q2_loan_usage`
  - `Q3_receivables`
  - `Q4_growth`
  - `Q5_financials`
  - `Q7_informality`
  - `Q10_loan_size`
- Selection is cluster-based (first unasked by priority).
- If Gate 2 answer is `not_sure` and confidence remains low, one additional Gate 2 question may be asked.

## 5) Gate 1 Scoring Rules

Example rules:

```text
if interest_band == "16-22%": S1 += 50
if gst_trend == "stable": S1 += 20

if recent_loan_experience == "rejected": S2 += 80
if loan_status == "multiple": S6 += 80
if cashflow == "frequently_tight": S7 += 70
if business_age == "<1yr": S9 += 80
if loan_status == "nbfc": S19 += 80
if gst_trend == "declining": S23 += 80
if loan_status == "no_loan": S25 += 80
```

## 6) Gate 2 Question Selection Logic

### Step 1: Identify primary scenario

```text
primary_scenario = max(scenario_scores)
cluster = scenario_cluster_map[primary_scenario]
```

### Step 2: Cluster -> question priority

```json
{
  "pricing": ["Q1_collateral", "Q2_loan_usage", "Q5_financials"],
  "cashflow": ["Q3_receivables", "Q2_loan_usage"],
  "credit_access": ["Q5_financials", "Q7_informality"],
  "growth": ["Q4_growth"],
  "informal": ["Q7_informality"],
  "behavior": ["Q6_behavior"],
  "inventory": ["Q9_inventory"]
}
```

### Step 3: Select next question

```python
for q in cluster_question_priority[cluster]:
    if q not in asked_questions:
        next_question = q
        break

if not next_question:
    next_question = "Q2_loan_usage"
```

## 7) Gate 3 Action Logic

After Gate 2 answer:

```python
if answer == "unsecured":
    root_cause = "unsecured_loan"
```

Action question mapping:

```json
{
  "unsecured_loan": "Do you have assets for collateral?",
  "working_capital_mismatch": "Do you need funds regularly?",
  "receivables_issue": "What is your collection cycle?",
  "financial_issue": "Can you provide audited financials?",
  "informal_issue": "Have you explored formal credit options?",
  "growth_gap": "Have you requested a higher limit?"
}
```

## 8) Stop Conditions

```python
if questions_asked >= 2: stop()
if confidence_score >= 80: stop()
if user_clicked_cta: stop()
```

## 9) State Object

```json
{
  "signals": {},
  "scenario_scores": {},
  "primary_scenario": "",
  "cluster": "",
  "questions_asked": [],
  "root_cause": "",
  "confidence": 0
}
```

### Implementation Note: Current Insight Logic

- Final insight selection is deterministic in current code.
- The engine first determines:
  - `primaryScenario`
  - `cluster`
  - `rootCause`
- Then `lib/loanInsight/templates.ts` selects:
  - Insight 1 from `SCENARIO_TEMPLATES[primaryScenario]`
  - Insight 2 from `ROOT_CAUSE_TEMPLATES[rootCause]`
  - Recommended action from `ACTION_BY_CLUSTER[cluster]`
- Runtime insight generation is template-based, not AI-generated.

### Current Deterministic Templates (source: `lib/loanInsight/templates.ts`)

```json
{
  "SCENARIO_TEMPLATES": {
    "S1": "Your loan pricing appears high compared with your business stability signals.",
    "S2": "Recent rejection signals suggest eligibility or packaging friction, not only demand-side issues.",
    "S4": "Your growth trend may not yet be reflected in the credit limit currently available.",
    "S5": "Your profile may support stronger terms than what you are currently receiving.",
    "S6": "Multiple active loans may be creating repayment inefficiency and fragmentation.",
    "S7": "Frequent cashflow tightness is likely influencing loan stress and repayment comfort.",
    "S9": "New business vintage may be affecting lender confidence and structure options.",
    "S12": "Current repayment burden may be too high relative to your operating cashflow rhythm.",
    "S14": "Informal borrowing patterns may be reducing formal lender confidence.",
    "S19": "NBFC-heavy dependency may be limiting access to lower-cost structured options.",
    "S23": "Recent GST decline may be impacting lender risk perception and terms.",
    "S25": "First-time borrower status may require a staged formal credit entry approach."
  },
  "ROOT_CAUSE_TEMPLATES": {
    "unsecured_loan": "Because the facility is unsecured, lenders are likely pricing in extra risk.",
    "working_capital_mismatch": "The loan structure appears mismatched to recurring working-capital usage.",
    "receivables_issue": "Long collections are likely creating repayment timing pressure.",
    "financial_issue": "Financial documentation quality may be limiting credit clarity for lenders.",
    "informal_issue": "Informal credit behavior may be diluting formal credit signals.",
    "growth_gap": "Recent growth may not yet be translated into revised lender limits.",
    "high_emi_pressure": "Monthly repayment pressure appears to be a key stress point.",
    "no_formal_credit_history": "Limited formal borrowing history may be restricting initial lender confidence."
  },
  "ACTION_BY_CLUSTER": {
    "pricing": "Compare secured and unsecured structures across lender classes before refinancing.",
    "cashflow": "Align repayment design to business cash conversion cycle before taking additional debt.",
    "credit_access": "Strengthen documentation and lender-ready packaging before next application.",
    "growth": "Request a limit revision backed by recent verified growth signals.",
    "informal": "Shift transaction behavior toward formal channels to improve credit visibility."
  }
}
```

## 10) AI Usage Guidelines (Design Intent)

AI should:

- Generate natural phrasing
- Parse user responses
- Generate insights

AI should not:

- Select scenarios
- Decide next question
- Control flow

## Hybrid AI Enrichment (Current Implementation)

The final output now supports a hybrid enrichment layer with deterministic guardrails.

### What is deterministic and locked

- `primaryScenario`, `cluster`, `rootCause`, and `confidence` remain rule-engine outputs.
- AI is not allowed to overwrite these fields.
- Deterministic recommended actions remain part of the allowed recommendation catalog.

### What AI enrichment adds

- `aiNarrative`: a concise explanation in natural language.
- `confidenceNarrative`: a user-readable explanation of confidence quality.
- `evidenceBullets`: evidence tied to lending signals.
- `riskSignals`: concise watchouts.
- `next90DayPlan`: actionable near-term plan.
- `reportSections`: structured report blocks (summary, diagnosis, action plan, watchouts).

### Guardrails and validation

- AI output must be strict JSON and pass schema checks.
- Mandatory recommendations outside the approved action catalog are rejected.
- Evidence must reference known lending-signal concepts.
- If validation or guardrails fail, system falls back to deterministic templates.

### Fallback behavior

- Fallback output is generated from deterministic templates in:
  - `lib/loanInsight/templates.ts`
  - `lib/loanInsight/ai.ts`
- Fallback reason is captured in `output.aiMeta.fallbackReason`.

## Final Summary (Target Design)

- 7 inputs -> detect key scenarios
- 1 question -> identify root cause
- 1 question -> qualify action
- Deterministic, scalable, and UX-optimized

## 11) AI Integration Layer [Not Implemented]

This section is future-state guidance and not current runtime behavior.

### Purpose

AI is used to:

- Improve conversational quality
- Interpret flexible user inputs
- Generate human-like insights

AI is not used for:

- scenario scoring
- question selection
- flow control

### Components

1. Input parsing (optional but recommended)
2. Question generation
3. Insight generation
4. Tone adaptation

### Example integration flow

```text
User answer
  -> AI parser (structured signal)
  -> Rule engine (decision)
  -> AI generator (question + insight)
  -> UI render
```

### Guardrails

1. AI must not override logic:

```python
next_question = rule_engine_output
```

2. Validate AI outputs:

```text
ensure valid JSON
fallback to defaults if parsing fails
```

3. Fallback system:

```text
use static question templates
use predefined insights
```