🧠 MSME Loan Insight UX Specification
1. Overview

This document defines the user experience, interaction flow, and behavioral logic for the MSME Loan Insight Engine.

The system is designed to feel like a guided expert conversation, not a form.

🎯 Experience Goals

The user should feel:

“This understands my business”
“This is fast and useful”
“This is not a loan application form”
🧠 Core Principles
One question at a time
Immediate insight feedback
No unnecessary inputs
No jargon
No forced validation (no OTP)
Progressive disclosure of depth
🧩 2. System Flow
Landing
  ↓
Gate 1 (Global Questions)
  ↓
Insight Reveal
  ↓
Gate 2 (Diagnostic Question)
  ↓
Refined Insight
  ↓
Lead Capture (Primary)
  ↓
Gate 3 (Action Question - optional)
  ↓
Final Insight
  ↓
CTA
🟢 3. Gate 1: Discovery Experience
Goal
Fast completion (<30 seconds)
Build trust
Capture key signals
Interaction Pattern
One question per screen
Multiple choice (no typing)
Show progress indicator
Questions
Revenue range
Business age
Loan status
Interest range
Cash flow stability
GST trend
Recent loan experience
Microcopy
“Takes 30 seconds”
“No documents required”
“Quick business check”
🧠 4. Insight Reveal (After Gate 1)
Purpose

Create first “aha” moment

Structure
Headline:

We noticed something about your loan

Primary Insight:

Your loan may be priced higher than your business risk.

Optional Supporting Insight:

There may also be some pressure from how your cash flow is structured.

UX Rules
Max 2 insights
No numbers or jargon
Add slight delay/animation before reveal
🟡 5. Gate 2: Diagnostic Question
Goal

Identify root cause (WHY)

Transition

Let me understand this a bit better…

Question Style

Conversational and contextual to insight

Example:

Is your loan secured against any asset, or is it unsecured?

UX Rules
Only 1 question
Must feel relevant to previous insight
Provide 3–4 options + “Not sure”
After Answer

Immediately show refined insight:

Got it. Since this is unsecured, lenders typically price it higher.

🟡 6. Primary Lead Capture (After Gate 2)
Objective

Capture user contact after delivering value

Trigger Conditions

Show lead capture if:

Gate 2 is completed
AND at least 1 strong insight exists
AND phone not already captured
UX Placement
Gate 2 Answer
   ↓
Refined Insight
   ↓
→ Lead Capture Screen
   ↓
Continue Flow
Screen Design
Headline:

Get your detailed loan analysis

Supporting Line:

Based on your inputs, there are ways you may be able to improve your loan terms.

Input:
Phone number (single field)
CTA:

Send my report

Microcopy:

No spam. No obligation.

Behavior Rules
Do NOT block user flow
No OTP / verification required
Allow user to continue after submission
Store lead asynchronously
Skip Option

Allow:

Skip for now

🔴 7. Gate 3: Action Question (Optional)
Goal

Move from diagnosis → solution readiness

Trigger

Show only if:

user continues after Gate 2
OR higher clarity is needed
Transition

One last thing to check…

Example Questions
Do you have assets that could be used as collateral?
Do you need funds regularly during the month?
Have you explored formal loan options before?
After Answer

Show final narrative:

You may be able to reduce your interest by restructuring your loan.

🔴 8. Secondary Lead Capture (Fallback)
Trigger

Show if:

user has NOT submitted phone
AND reaches end of Gate 3
Screen
Headline:

Want a complete breakdown for your business?

Supporting Line:

We’ll help you understand better options based on your profile.

Input:
Phone number
CTA:

Talk to an expert

🎯 9. Final CTA
Options
Talk to an expert
Get full analysis
Explore better loan options
UX Rules
Always contextual
Never pushy
Always tied to insight
⚙️ 10. State → UX Mapping
STATE: collecting_inputs
→ Show Gate 1

STATE: insight_ready
→ Show Insight Reveal

STATE: awaiting_gate2
→ Show Gate 2 question

STATE: refining_insight
→ Show refined insight

STATE: awaiting_lead_capture
→ Show lead capture

STATE: awaiting_gate3
→ Show Gate 3 question

STATE: final_output
→ Show final insight + CTA
⚙️ 11. Dynamic Behavior Rules
Rule 1: Skip irrelevant steps
No loan → skip collateral-type questions
Rule 2: Stop early if confidence is high
Skip Gate 3 if strong insight exists
Rule 3: Max question limits
Gate 1: 6–7 questions
Gate 2: 1 question
Gate 3: 1 question
Rule 4: Do not repeat lead capture
if lead_captured:
    skip_lead_capture()
🎨 12. Tone & Voice
Simple
Human
Non-judgmental
Advisory
Examples

❌ Your profile is weak
✅ Lenders may see some risk here

⚠️ 13. Error Handling
If user selects “Not sure”

No worries, we’ll estimate based on your inputs.

If user drops off

Resume with:

Let’s continue from where you left off

🎬 14. Transitions & Motion
Smooth screen transitions
Small delay before insights
No abrupt jumps
🔥 Final Outcome

User should feel:

understood
guided
not interrogated
not sold to
🚀 Implementation Notes
This file defines behavior
UI design (Figma) should follow this spec
Logic engine should control state transitions
No OTP / WhatsApp verification in MVP