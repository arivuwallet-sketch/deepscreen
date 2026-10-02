# Investment blog editorial audit — 2 October 2026

## Scope

This audit records the research plan, cannibalization check, source map and claim controls for the first DeepScreen mutual-fund / ETF / REIT blog cluster.

Published routes:
- /blog/direct-vs-regular-mutual-funds-india
- /blog/etf-tracking-error-vs-tracking-difference
- /blog/ndcf-vs-affo-reit-analysis-india

Pillar/topic hubs remain:
- /mutual-funds
- /etfs
- /reits
- /investments

The blog posts target narrower informational/comparison intents and link back to the broader hubs. They are not templated copies of the hub FAQs.

## Editorial standard applied

- Answer the query near the top.
- Truth and primary-source verification before search optimization.
- Original information gain in every article.
- No keyword-density targets and no meta-keywords field.
- Visible FAQ content and FAQPage schema use the same answer set.
- No claim that FAQ schema creates a Google rich result.
- No hidden content or bot-only copy.
- Finance/YMYL disclosures are visible and state that the content is educational, not personalized advice.
- Time-sensitive regulations are dated.
- Worked examples are labelled hypothetical and are not forecasts.
- A named credentialed financial reviewer was not supplied, so none is fabricated. The article explicitly states this.

## SERP and content-gap review

### Direct vs Regular mutual funds
Observed result patterns included AMFI's Direct Plan explainer plus 2026 guides from ClearTax, Kotak Neo and specialist mutual-fund sites. Most results explain the lower Direct Plan expense ratio and distributor role. Common gaps: weak separation between the fund decision and the plan decision, overconfident 'always choose Direct' language, and little transparent compounding methodology.

DeepScreen angle: the Cost-Gap Calculator shows several hypothetical annual gaps with explicit assumptions, then separates plan economics from scheme suitability and switching consequences.

### ETF tracking error vs tracking difference
Observed results included NSE, Fidelity, ETF.com, Morningstar and specialist ETF guides. Definitions are generally strong. Common gap: pages often stop after the two formulas and do not connect tracking quality to the investor's execution layer.

DeepScreen angle: the Tracking Matrix combines magnitude and consistency, then adds spread and premium/discount as a separate execution layer.

### NDCF vs AFFO
Observed results included SEBI rules/circulars, the Indian REITs Association, issuer presentations and REIT analysis sites. Many pages explain NDCF or REIT selection but fewer clearly separate NOI, FFO, AFFO and NDCF for Indian readers.

DeepScreen angle: the REIT Cash-Flow Bridge shows which metric belongs at which level and explains why standardized Indian NDCF should not be replaced with a homemade AFFO proxy.

## Claims ledger

| # | Claim | Type | Source | Status |
| --- | --- | --- | --- | --- |
| 1 | Direct and Regular plans of the same scheme can share a common portfolio and fund manager while expense ratios differ. | product/regulatory education | AMFI, Direct Plan | verified |
| 2 | Direct Plan has a lower expense ratio because distributor/agent distribution cost is excluded. | product/regulatory education | AMFI, Direct Plan; AMFI TER disclosures | verified |
| 3 | Mutual-fund NAV is disclosed after scheme expenses are deducted. | product/definition | AMFI, Expense Ratio | verified |
| 4 | Current AMFI TER disclosure references the SEBI (Mutual Funds) Regulations, 2026 and states Direct base expense excludes distribution expenses/commission. | regulatory/current | AMFI TER disclosure | verified 2026-10-02 |
| 5 | Scheme-specific Regular-to-Direct switches can have exit-load rules and must be checked in the current scheme document. | product/transaction | SEBI and AMFI-hosted scheme documents | verified as scheme-specific; article avoids universal rule |
| 6 | NSE defines tracking error as annualized standard deviation of fund-minus-index return differences. | definition | NSE Tracking Error | verified |
| 7 | NSE says tracking error should be calculated against the Total Returns Index. | definition/method | NSE Tracking Error | verified |
| 8 | ETF tracking can be affected by flows, corporate actions, index changes, cash and transaction costs. | explanatory | NSE Tracking Error | verified |
| 9 | ETF market price can trade above or below NAV, and bid-ask spread is a transaction cost. | investor education | Investor.gov ETF bulletin | verified |
| 10 | SEBI has a standardized NDCF framework for REITs. | regulation | SEBI 6 Dec 2023 NDCF circular | verified |
| 11 | SEBI REIT Regulations were last amended 18 Apr 2026. | date/regulation | SEBI REIT Regulations page | verified 2026-10-02 |
| 12 | Indian REIT framework requires minimum distribution of applicable NDCF. | regulation | SEBI REIT Regulations / NDCF circular | verified |
| 13 | AFFO has no standardized definition. | definition | Nareit AFFO glossary | verified |
| 14 | Brookfield India REIT publishes an NDCF walk-down showing NOI, financing adjustments, NDCF per unit and distribution per unit. | issuer example | Brookfield India REIT Q1 FY2026 earnings presentation | verified |
| 15 | The Cost-Gap Calculator, Tracking Matrix and REIT Cash-Flow Bridge are DeepScreen-created educational frameworks/examples. | original content | DeepScreen calculation/framework | verified internally |

## Original calculation note

The Cost-Gap Calculator assumes ₹10,000 contributed at each month-end for 20 years. The lower-cost illustrative return is 11.5% annualized. The higher-cost scenarios are 11.25%, 11.0% and 10.5%. Annual returns are converted to effective monthly rates before applying the ordinary-annuity future-value formula. The outputs are rounded to one decimal lakh and are not predictions of any fund.

## Refresh triggers

Review these articles when:
- SEBI materially changes mutual-fund plan/expense rules.
- NSE changes its published tracking-error methodology.
- SEBI changes the REIT NDCF framework or distribution requirement.
- A primary source URL moves or becomes unavailable.
- DeepScreen adds a calculation/data source that materially improves one of the guides.

Do not change dateModified merely to signal freshness; update it only after a substantive editorial review.
