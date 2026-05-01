	REQUEST BODY:
	{
	  "turnover_bucket": 1-5,           // 1=<50L, 2=50L-1Cr, 3=1-5Cr, 4=5-10Cr, 5=>10Cr
	  "vintage_bucket":  1-5,           // 1=<1Y, 2=1-2Y, 3=2-3Y, 4=3-5Y, 5=>5Y
	  "gst_bucket":      1-4,           // 1=Regular, 2=Mostly, 3=Delays, 4=Not registered
	  "emi_bucket":      1-5,           // 1=None, 2=<10%, 3=10-25%, 4=25-40%, 5=>40%
	  "credit_bucket":   1-4,           // 1=Both clean, 2=Personal only, 3=No history, 4=Has defaults
	  "lead_metadata": {"phone": "...", "email": "...", "company_name": "..."}
	}
	
	RESPONSE:
	{
	  "tier": 1-4,                      // 1=Very High, 2=High, 3=Medium, 4=Low
	  "tier_label": "Very High Eligibility",
	  "headline": "You're in the top tier.",
	  "score": 87,                      // Internal-only, do NOT show on UI
	  "color": "green",                 // green | green | amber | red
	  "request_id": "uuid"
	}
	
	
PSEUDOCODE	
	function calculateTier(turnover_b, vintage_b, gst_b, emi_b, credit_b):
	
	    # Score lookup tables (constants — match Excel & widget)
	    TURNOVER_SCORE = [4, 10, 18, 23, 25]      # 5 buckets, max 25
	    VINTAGE_SCORE  = [0, 8, 14, 18, 20]       # 5 buckets, max 20
	    GST_SCORE      = [15, 11, 5, 6]           # 4 buckets, max 15
	    EMI_SCORE      = [15, 13, 9, 4, 1]        # 5 buckets, max 15
	    CREDIT_SCORE   = [25, 20, 10, 4]          # 4 buckets, max 25
	
	    # Step 1: Sum component scores
	    score = (
	        TURNOVER_SCORE[turnover_b - 1] +
	        VINTAGE_SCORE[vintage_b - 1] +
	        GST_SCORE[gst_b - 1] +
	        EMI_SCORE[emi_b - 1] +
	        CREDIT_SCORE[credit_b - 1]
	    )
	
	    # Step 2: Hard gate — vintage<1Y AND no credit history
	    if vintage_b == 1 and credit_b == 3:
	        score = 0
	        tier  = 4
	    else:
	        # Step 3: Score → tier
	        if   score >= 80: tier = 1   # Very High
	        elif score >= 60: tier = 2   # High
	        elif score >= 40: tier = 3   # Medium
	        else:             tier = 4   # Low
	
	    # Step 4: Build response
	    TIER_LABELS    = ['Very High Eligibility', 'High Eligibility', 'Medium Eligibility', 'Low Eligibility']
	    TIER_HEADLINES = [
	        "You're in the top tier.",
	        "You qualify well.",
	        "Eligibility with conditions.",
	        "Build readiness first."
	    ]
	    TIER_COLORS = ['green', 'green', 'amber', 'red']
	
	    return {
	        'tier': tier,
	        'tier_label': TIER_LABELS[tier - 1],
	        'headline':   TIER_HEADLINES[tier - 1],
	        'score':      score,           # internal-only
	        'color':      TIER_COLORS[tier - 1]
	    }
VALIDATION & EDGE CASES	
	1. INPUT VALIDATION: All buckets must be in valid ranges. 400 if not.
	
	2. HARD GATE: vintage_b=1 AND credit_b=3 forces tier=4. This catches pre-revenue + NTC cases.
	
	3. RATE LIMITING: 10 requests per IP per hour.
	
	4. ANALYTICS: Log all 5 inputs + tier + score + lead_metadata for funnel analysis.
	   Score (not just tier) helps identify near-miss leads to nurture.
	
	5. CACHING: Same inputs always produce same output. Cache 1 hour.
	
	6. UI MUST NOT DISPLAY THE SCORE — only tier label + headline. Score is internal-only.