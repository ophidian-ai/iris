# Lead Sources -- What Works

> Reference document for finding prospects efficiently. Updated as new sources are tested.

## Proven Sources (2026-03-06)

### Tier 1 -- High Yield

| Source                          | Query Strategy                             | Why It Works                                                                                                   | Prospects Found                                   |
| ------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Yelp** (via Firecrawl search) | `"yelp.com" Columbus IN [industry]`        | Yelp lists real, active businesses with reviews. High-review businesses with bad websites are ideal prospects. | Nano's Car Detailing, Papa's Grill, Total Fitness |
| **Google Maps / Local Pack**    | `[industry] Columbus IN` (standard search) | Surfaces established businesses. Cross-reference their website quality.                                        | SAK Automotive, Columbus Massage Center           |

### Tier 2 -- Moderate Yield

| Source                                | Query Strategy                             | Why It Works                                                                      | Prospects Found                 |
| ------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| **Columbus Area Chamber of Commerce** | `business.columbusareachamber.com/list`    | Official directory of local businesses. Many chamber members have outdated sites. | Background research, validation |
| **Visit Columbus Indiana**            | `comeseecolumbus.com/blog/small-business/` | Tourism/visitor site lists local shops and businesses. Good for retail/food.      | Background leads                |
| **Facebook Groups**                   | `"Columbus Indiana" local business`        | Columbus buy/sell/trade groups surface small businesses posting services.         | Context only (hard to scrape)   |

### Tier 3 -- Low Yield / Supplemental

| Source                         | Query Strategy                              | Why It Works                                             | Notes                                         |
| ------------------------------ | ------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| **Alignable**                  | `alignable.com/columbus-in/directory`       | Small business networking directory.                     | Requires account for full access              |
| **CityByApp**                  | `citybyapp.com/indiana/columbus`            | Local business directory.                                | Smaller database                              |
| **INBiz**                      | `inbiz.in.gov`                              | State business registrations.                            | No website quality info                       |
| **HomeAdvisor / Angi / Porch** | `[industry] Columbus IN` on these platforms | Service businesses listed here often have weak websites. | Good for trades (HVAC, plumbing, landscaping) |

## Effective Firecrawl Search Queries

These queries produced usable results during the 2026-03-06 prospecting session:

| Query                                                   | What It Found                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `"small businesses Columbus Indiana outdated websites"` | Chamber directory, Yelp listings, Reddit discussions                           |
| `"yelp.com" Columbus IN restaurants`                    | Papa's Grill, 4th Street Bar (closed), local restaurant listings               |
| `"Columbus Indiana" car detailing cleaning services`    | Nano's Car Detailing                                                           |
| `"Columbus Indiana" gym fitness center`                 | Total Fitness, AEI Fitness (too modern)                                        |
| `"Columbus Indiana" lawn care landscaping`              | Jeff's (merged), Pahl's (decent site), Columbus Lawn Care Pros (lead gen site) |
| `"Columbus Indiana" HVAC plumbing services`             | Watts, Peterman, Summers -- mostly franchise/well-funded sites                 |

## Filtering Criteria

Not every business found is a good prospect. Apply these filters:

| Keep                                    | Drop                                              |
| --------------------------------------- | ------------------------------------------------- |
| 50+ reviews, bad website                | Franchise or chain businesses                     |
| Established (5+ years), outdated site   | Already modern, well-built site                   |
| Active social media, weak web presence  | Closed or closing businesses                      |
| Service business with no online booking | Lead gen / aggregator sites (not real businesses) |
| Local owner-operated                    | Businesses that merged or were acquired           |

## Industries That Produced Good Prospects

1. **Auto services** (detailing, repair, body shops) -- often use vendor templates (Hibu, GoDaddy)
2. **Fitness / gyms** -- dated WordPress sites, no online signup
3. **Food / restaurants** -- GoDaddy builders, missing online ordering
4. **Personal services** (massage, salon, spa) -- template sites, no booking integration

## Industries That Did NOT Produce Good Prospects

1. **HVAC / Plumbing** -- dominated by franchises with corporate sites (Peterman, Summers)
2. **Lawn care / Landscaping** -- many part-time operations without websites at all, or businesses that merged
3. **Retail** -- most either have no website or use Shopify (which is adequate)

## Recommended Prospecting Workflow

1. Start with Yelp searches by industry (`firecrawl search "yelp.com" Columbus IN [industry]`)
2. Open the Yelp listing pages to find top-reviewed businesses
3. Scrape each business's actual website to evaluate quality
4. Cross-reference with Chamber of Commerce directory for additional leads
5. Filter using criteria above
6. Build prospect folder for viable candidates

**Time estimate:** ~30-45 minutes per batch of 2-3 qualified prospects using this workflow.
