# Alternative Data Sources for County/Local Officials

## Executive Summary

Research conducted to find alternative data sources to supplement Cicero API for county and local government officials.

**Key Finding:** Google Civic Information API was discontinued in April 2025, leaving a significant gap in the market. Commercial APIs provide the best coverage.

---

## Evaluated Data Sources

### 1. Google Civic Information API ⚠️ DISCONTINUED
- **Status:** Representatives API shut down April 30, 2025
- **Current State:** Only election-related endpoints remain (voterInfoQuery)
- **Coverage:** N/A - no longer provides official contact information
- **Verdict:** ❌ Not viable

### 2. OpenStates API ✅ GOOD FOR STATE
- **Status:** ✅ Active, well-maintained
- **Coverage:** Excellent state legislative data for all 50 states
- **API Access:** Free, RESTful JSON API
- **Data Quality:** Comprehensive for state legislators
- **Limitation:** Limited county/local support
- **Integration:** Easy (similar to Cicero)
- **Cost:** Free
- **Verdict:** ✅ Excellent for state, insufficient for county/local

### 3. Ballotpedia API 💰 VIABLE BUT EXPENSIVE
- **Status:** ✅ Active
- **Coverage:** 300,000+ officials including top 100 cities, 82,000 school board members
- **API Access:** GraphQL API, requires sales contact
- **Data Quality:** Good for federal/state, "less comprehensive" for local
- **Integration:** Medium difficulty (GraphQL vs REST)
- **Cost:** 💰 Paid (pricing not public)
- **Verdict:** ✅ Good option if budget allows

### 4. BallotReady API 💰 BEST LOCAL COVERAGE
- **Status:** ✅ Active, professional service
- **Coverage:** 200,000+ officeholders at ALL levels including sub-municipal
- **API Access:** GraphQL API with excellent infrastructure (1,100+ req/sec)
- **Data Quality:** Excellent - email, phone, addresses, social media, daily updates
- **Integration:** Medium difficulty (GraphQL)
- **Cost:** 💰 Paid (custom pricing, requires demo)
- **Verdict:** ⭐ RECOMMENDED - Best local coverage available

### 5. 5 Calls Representatives API ✅ FREE ALTERNATIVE
- **Status:** ✅ Active, positioned as Google Civic replacement
- **Coverage:** Claims better coverage than Google Civic had
- **API Access:** RESTful JSON, requires API key request (hello@5calls.org)
- **Data Quality:** Unknown (limited documentation)
- **Integration:** Easy (REST API)
- **Cost:** Free
- **Verdict:** ✅ WORTH TESTING - Free supplement to test first

### 6. Other Sources Evaluated

**USA.gov APIs**
- Federal agencies only
- ❌ Not applicable for local officials

**Democracy Works Election Data API**
- Election data focus, not official lookup
- ❌ Not suitable

**ProPublica Congress API**
- Federal only
- ❌ Not suitable for county/local

**GovTrack**
- Federal only
- ❌ Not suitable

**Local Open Data Portals**
- 3,000+ separate jurisdictions
- ❌ Too fragmented to integrate practically

**NACo (National Association of Counties)**
- No API available
- ❌ Data portal only, not programmable

---

## Recommended Strategies

### Option A: Multi-Source Commercial (BEST COVERAGE)

**Setup:**
1. **Cicero API** (current) - Federal and state officials
2. **BallotReady API** (add) - County and local officials

**Advantages:**
- Comprehensive coverage at all levels (federal → sub-municipal)
- Professional support and SLAs
- Daily updates
- 200,000+ local officials
- Complete contact information

**Disadvantages:**
- Requires budget for two APIs
- GraphQL integration effort
- Data normalization needed

**Cost:** $$ (two commercial APIs)

---

### Option B: Budget-Conscious (FREE ALTERNATIVE)

**Setup:**
1. **Cicero API** (current) - Federal and state
2. **5 Calls API** (add, free) - Test as supplement
3. **OpenStates API** (add, free) - State legislator details

**Advantages:**
- Minimal additional cost
- Easy REST integration
- Worth testing before commercial commitment

**Disadvantages:**
- Unknown coverage quality (5 Calls)
- Likely still have county/local gaps
- Less reliable support

**Cost:** $ (Cicero only, test free options)

---

### Option C: Hybrid Approach (BALANCED)

**Setup:**
1. **Cicero API** - Federal and state
2. **5 Calls API** - Free tier testing
3. **BallotReady API** - Add for specific high-priority jurisdictions only

**Advantages:**
- Test free options first
- Targeted paid coverage where needed
- Gradual cost increase

**Disadvantages:**
- Complex integration (3 sources)
- Partial coverage

**Cost:** $$

---

## Implementation Considerations

### Technical Challenges

1. **API Format Differences**
   - Cicero: REST JSON
   - BallotReady/Ballotpedia: GraphQL
   - 5 Calls: REST JSON

2. **Data Normalization**
   - Different field names and structures
   - Need unified data model
   - Handle missing fields gracefully

3. **Fallback Logic**
   ```
   Try Cicero → If county/local empty → Try BallotReady → If still empty → Try 5 Calls
   ```

4. **Caching Strategy**
   - Cache by ZIP code + level
   - TTL: 30 days (officials don't change often)
   - Reduces API costs

### Integration Complexity

**Easy:** Adding 5 Calls API (REST, similar to Cicero)
**Medium:** Adding OpenStates (different structure)
**Hard:** Adding BallotReady/Ballotpedia (GraphQL, data model mapping)

---

## Next Steps

### Immediate Actions (Week 1-2)

1. ✅ **Request 5 Calls API key** (free)
   - Email: hello@5calls.org
   - Reason: Testing as Google Civic replacement
   - No cost, low risk

2. ✅ **Request BallotReady demo**
   - Contact: via website form
   - Get pricing and test data quality
   - Evaluate coverage in your priority states

3. ✅ **Request Ballotpedia demo** (optional)
   - Alternative to BallotReady
   - Compare pricing and coverage

4. ✅ **Document Cicero gaps**
   - Test specific ZIP codes in your target areas
   - Document which county/local officials are missing
   - Use this data to evaluate alternatives

### Testing Phase (Week 3-4)

1. **Test 5 Calls integration** (when key received)
   - Sample 10-20 ZIP codes
   - Compare coverage vs Cicero
   - Measure data quality

2. **Evaluate demos**
   - BallotReady coverage analysis
   - Cost-benefit analysis
   - Integration effort estimate

3. **Make decision**
   - Budget approval if needed
   - Choose Option A, B, or C
   - Create implementation timeline

---

## Budget Considerations

### API Costs (Estimated)

- **Cicero API:** $XXX/month (current)
- **BallotReady API:** Custom pricing (requires demo)
- **Ballotpedia API:** Custom pricing (requires demo)
- **5 Calls API:** Free
- **OpenStates API:** Free

### Development Costs

- **Integration effort:** 20-40 hours
- **Data normalization:** 10-20 hours
- **Testing and QA:** 10-15 hours
- **Total:** 40-75 hours

---

## Contact Information

### API Providers

**5 Calls API**
- Email: hello@5calls.org
- Docs: https://apidocs.5calls.org/
- Status: Active

**BallotReady**
- Website: https://organizations.ballotready.org/ballotready-api
- Contact: Demo request form on website
- Status: Active

**Ballotpedia**
- Website: https://developer.ballotpedia.org
- Contact: Sales team via website
- Status: Active

**OpenStates**
- Website: https://openstates.org
- Docs: https://docs.openstates.org/api-v3/
- Email: contact@openstates.org
- Status: Active

**Cicero API (Current Provider)**
- Website: https://www.cicerodata.com/
- Support: Via customer portal
- Status: Active

---

## Conclusion

**The Reality:** County and local official data is fragmented and challenging. Google Civic's shutdown in April 2025 left a significant gap.

**Best Solution:** BallotReady API provides the most comprehensive county/local coverage (200,000+ officials), but requires budget.

**Pragmatic Approach:**
1. Test 5 Calls API first (free, low risk)
2. If coverage insufficient, add BallotReady
3. Use OpenStates to enhance state legislator details

**My Recommendation:** Start with 5 Calls API testing while requesting BallotReady demo. Make final decision based on actual coverage data for your priority jurisdictions.

---

*Research conducted: January 2026*
*Next review: After 5 Calls API testing completed*
