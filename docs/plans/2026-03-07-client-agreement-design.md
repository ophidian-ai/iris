# Client Agreement Template -- Design Doc

**Date:** 2026-03-07
**Status:** Approved
**Purpose:** Standard client agreement for OphidianAI web development projects covering IP ownership, licensing, attribution rights, portfolio rights, and payment terms.

---

## Overview

A reusable markdown template (`operations/templates/client-agreement.md`) with placeholder variables for client-specific details. Exported to PDF and sent via Dropbox Sign ($15/mo) for e-signature.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| IP Model | Split ownership | Client owns content + assembled site; Developer owns code/components |
| Attribution | Default with opt-out ($500 fee) | Builds brand visibility; small revenue line for removal |
| Payment (Starter/Professional) | 50/50 | Industry standard for projects under $5K |
| Payment (E-Commerce) | 33/33/33 | Longer projects benefit from milestone billing |
| E-Signature Platform | Dropbox Sign | $15/mo, industry-standard, legally binding, affordable |
| Late Fees | 1.5% per month | Industry standard |
| Invoice Terms | Net 15 | Keeps cash flow tight for a solo founder |
| Governing Law | State of Indiana | Eric's location |

## Template Variables

- `{{CLIENT_NAME}}` -- Client's legal name
- `{{CLIENT_BUSINESS}}` -- Client's business/DBA name
- `{{CLIENT_EMAIL}}` -- Client's email address
- `{{PROJECT_DESCRIPTION}}` -- Brief project description
- `{{DELIVERABLES}}` -- Itemized list of deliverables
- `{{TOTAL_FEE}}` -- Total project fee
- `{{PAYMENT_SCHEDULE}}` -- 50/50 or 33/33/33 with amounts
- `{{ESTIMATED_DELIVERY}}` -- Estimated delivery date
- `{{MAINTENANCE_FEE}}` -- Monthly maintenance fee (if applicable)
- `{{EFFECTIVE_DATE}}` -- Date agreement takes effect

## Agreement Sections

### 1. Scope of Work
- Project description and deliverables
- Number of pages, features, specific functionality
- Revision rounds included
- Explicit exclusions (prevents scope creep)

### 2. Timeline
- Estimated delivery date
- Client responsible for content/feedback within 5 business days
- Client-caused delays don't extend Developer obligations

### 3. Payment Terms
- Starter/Professional: 50% upfront, 50% before launch
- E-Commerce: 33% upfront, 33% at midpoint, 33% before launch
- Net 15 on all invoices
- 1.5% per month late fee on overdue balances
- Work pauses if payment is 15+ days overdue

### 4. Intellectual Property (Split Ownership)
- **Client owns:** Content they provide (text, photos, logos, brand assets) and the final assembled website as a whole upon full payment
- **Developer owns:** Underlying code structure, reusable components, frameworks, and development tools
- **Client gets:** Perpetual, non-exclusive license to use, modify, and host the code
- **Developer gets:** Right to reuse generic code patterns/components (not client brand-specific work)

### 5. Attribution
- "Built by OphidianAI" credit with logo and link included by default
- Removal available for one-time $500 fee
- Portfolio rights retained regardless of attribution removal

### 6. Monthly Maintenance (if applicable)
- Hosting, SSL, security checks, minor content updates, uptime monitoring
- Cancellation with 30 days written notice
- Site files exported upon request after cancellation

### 7. Termination
- Either party can terminate with 14 days written notice
- Work billed proportionally up to termination date
- Client receives completed deliverables upon payment of outstanding balance
- Upfront deposit non-refundable if Client terminates mid-project

### 8. Liability & Warranty
- 30-day functionality warranty post-launch
- No liability for third-party services (Stripe, Vercel, Supabase, etc.)
- Total liability capped at project fee paid
- No guarantee of specific business results

### 9. Confidentiality
- Mutual non-disclosure of confidential business information
- Does not apply to publicly available information or portfolio use

### 10. Governing Law
- State of Indiana
- Disputes resolved through mediation before litigation

## Implementation

1. Write the template to `operations/templates/client-agreement.md`
2. Update `operations/references/pricing-structure.md` with attribution opt-out fee
3. Update `operations/templates/client-handoff.md` to reference the agreement
4. Log decision in `operations/decisions/log.md`
