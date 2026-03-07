# Revised Plan: Admin Variant Management on Product Pages

**Date:** 2026-03-06
**Status:** Pending approval
**Codebase:** `/Users/elefler/Projects/bloomin_acres/`

## Context

The admin wants to control which product variants are visible to customers, track inventory quantities, and reorder variants via drag-and-drop. Currently, all variants are always shown to customers with no availability toggle, no inventory count, and no way to reorder them.

## Audit of Original Plan

**Line number accuracy:** All references verified against actual code. menu.html range was slightly imprecise (dropdown HTML at lines 361-374, button visibility at line 386).

**Gaps identified and addressed:**

1. Two codepaths for variation rows -- static template string (lines 188-196) AND `addVariationRow()` both need updating
2. Post-save pill refresh missing -- customer-facing pills don't update without reload
3. Filtered index bug -- `i === 0` logic must use filtered array index, not original
4. menu.html "Options" button must check `availableVariations.length`, not `variations.length`
5. All-variants-hidden edge case -- hide entire variation selector when no variants pass filter
6. SVG `pointer-events: none` needed on drag handle icon for reliable drag initiation

## Files to Modify

| File            | Path                                                    |
| --------------- | ------------------------------------------------------- |
| product.html    | `/Users/elefler/Projects/bloomin_acres/product.html`    |
| css/product.css | `/Users/elefler/Projects/bloomin_acres/css/product.css` |
| menu.html       | `/Users/elefler/Projects/bloomin_acres/menu.html`       |

## Data Model

No SQL migration needed. `product_details.variations` is JSONB. New fields (`available`, `quantity`) are added to the JSON objects. Backward compatibility: `v.available !== false` (missing = available), `v.quantity === undefined` (missing = shown).

---

## Phase 1 -- CSS (`css/product.css`)

### 1a. Edit existing `.variation-row` rule at line 290

```css
/* BEFORE */
.variation-row {
  display: flex; align-items: center; gap: .5rem;
  margin-bottom: .5rem;
}

/* AFTER */
.variation-row {
  display: flex; align-items: center; gap: .5rem;
  margin-bottom: .5rem;
  border: 1.5px solid transparent;
  border-radius: 4px;
  padding: .25rem .25rem .25rem 0;
  transition: border-color .15s, opacity .2s;
}
```

### 1b. Append new classes after line 329

```css
/* Drag handle */
.variation-drag-handle {
  display: flex; align-items: center; justify-content: center;
  width: 20px; flex-shrink: 0;
  cursor: grab; color: rgba(74,51,34,.3);
  touch-action: none;
}
.variation-drag-handle:active { cursor: grabbing; }
.variation-drag-handle svg { pointer-events: none; }

/* Availability checkbox */
.variation-available-check {
  flex-shrink: 0;
  width: 15px; height: 15px;
  accent-color: var(--sage-dark);
  cursor: pointer;
}

/* Quantity input */
.variation-qty-wrap {
  display: flex; align-items: center; gap: .25rem; flex-shrink: 0;
}
.variation-qty-label {
  font-size: .75rem; color: var(--earth-mid); white-space: nowrap;
}
.variation-qty-input {
  width: 58px; padding: .45rem .4rem;
  border: 1.5px solid rgba(74,51,34,.18); border-radius: 4px;
  background: var(--farm-cream); font-family: var(--font-body);
  font-size: .85rem; color: var(--earth-brown);
  text-align: center;
}
.variation-qty-input:focus { outline: none; border-color: var(--sage-dark); }

/* Drag and availability states */
.variation-row-unavailable { opacity: .42; }
.variation-row.drag-over-above { border-top-color: var(--sage-dark); }
.variation-row.drag-over-below { border-bottom-color: var(--sage-dark); }
.variation-row-dragging { opacity: .35; }

/* Stock note on customer pills */
.variation-stock-note {
  font-size: .75rem;
  color: var(--burnt-orange);
  font-weight: 400;
}
```

---

## Phase 2 -- `product.html` Admin Panel

### 2a. Static template string -- `adminVariationsHtml` (lines 188-196)

Replace the `.map()` callback to include drag handle, checkbox, and qty input per row:

```js
${(productDetails?.variations || []).map(v => `
  <div class="variation-row${v.available === false ? ' variation-row-unavailable' : ''}">
    <span class="variation-drag-handle" title="Drag to reorder">
      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/>
        <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
        <circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/>
      </svg>
    </span>
    <input type="checkbox" class="variation-available-check" title="Visible to customers" ${v.available !== false ? 'checked' : ''} />
    <input type="text" class="variation-name-input" placeholder="Name (e.g. Large)" value="${escHtml(v.name)}" />
    <div class="variation-delta-wrap">
      <span class="variation-delta-prefix">+$</span>
      <input type="number" class="variation-delta-input" step="0.01" min="0" placeholder="0.00" value="${((v.price_delta || 0) / 100).toFixed(2)}" />
    </div>
    <div class="variation-qty-wrap">
      <span class="variation-qty-label">Qty</span>
      <input type="number" class="variation-qty-input" min="0" max="9999" placeholder="0" value="${v.quantity ?? 0}" />
    </div>
    <button type="button" class="btn-variation-remove" title="Remove">&times;</button>
  </div>`).join('')}
```

### 2b. New helper: `wireVariationRowBehavior(row)` -- insert before line 329

Handles remove button, checkbox dimming, desktop HTML5 drag-and-drop, and mobile touch drag. All behavior centralized in one function called for both existing rows on load and new rows added dynamically.

- Checkbox `change` listener toggles `.variation-row-unavailable`
- Drag handle `mousedown`/`mouseup` toggles `draggable` attribute
- `dragstart`/`dragend`/`dragover`/`dragleave`/`drop` events for desktop reorder
- `touchstart`/`touchmove`/`touchend` events on handle for mobile reorder
- Remove button click listener

### 2c. Update `addVariationRow()` (line 329)

- New signature: `addVariationRow(name = '', delta = '', available = true, quantity = 0)`
- Row HTML matches updated template from 2a
- Calls `wireVariationRowBehavior(row)` instead of inline event wiring

### 2d. Update `wireAdminSave()` (lines 349-351)

Replace existing remove-button loop with:

```js
document.querySelectorAll('#variations-list .variation-row').forEach(row => {
  wireVariationRowBehavior(row);
});
```

### 2e. Save handler -- collect `available` and `quantity` (lines 396-401)

```js
const variations = [];
document.querySelectorAll('#variations-list .variation-row').forEach(row => {
  const name = row.querySelector('.variation-name-input').value.trim();
  const deltaRaw = parseFloat(row.querySelector('.variation-delta-input').value) || 0;
  const available = row.querySelector('.variation-available-check').checked;
  const quantity = parseInt(row.querySelector('.variation-qty-input').value, 10) || 0;
  if (name) variations.push({ name, price_delta: Math.round(deltaRaw * 100), available, quantity });
});
```

### 2f. Post-save -- refresh customer pill view (after line 411)

After `productDetails` is updated, add targeted refresh of `#variation-options`:

- Filter variations using same logic as customer view
- Rebuild pill HTML with stock notes for qty 1-5
- Re-wire pill selection listeners
- Hide variation selector if no variants pass filter

---

## Phase 3 -- `product.html` Customer Variation Pills (lines 165-182)

Replace `variationSelectorHtml` block:

- Add `visibleVariations` filter: `variations.filter(v => v.available !== false && (v.quantity === undefined || v.quantity > 0))`
- Use `visibleVariations` for pill rendering and length check
- Add stock note `(N left)` when `quantity > 0 && quantity <= 5`
- Index against filtered array so `i === 0` selection logic is correct

---

## Phase 4 -- `menu.html` Variation Filtering

### 4a. Filter before dropdown HTML (after line 356)

```js
const availableVariations = variations.filter(v =>
  v.available !== false && (v.quantity === undefined || v.quantity > 0)
);
```

Use `availableVariations` for dropdown HTML (lines 361-374).

### 4b. "Options" button visibility (line 386)

Change `variations.length > 0` to `availableVariations.length > 0`.

---

## Build Sequence

1. Phase 1: CSS edits in `css/product.css`
2. Phase 2a-2c: Admin template + `wireVariationRowBehavior()` + `addVariationRow()` in `product.html`
3. Phase 2d-2f: `wireAdminSave()` update, save handler, post-save refresh in `product.html`
4. Phase 3: Customer pill filtering in `product.html`
5. Phase 4: Dropdown filtering in `menu.html`

## Verification

1. `node serve.mjs` from `/Users/elefler/Projects/bloomin_acres/`
2. Admin product page -- verify drag handle, checkbox, qty input, remove button on each variant row
3. Uncheck a variant -- verify row dims immediately
4. Save, reload -- verify unchecked variant hidden from customer pills
5. Set variant qty to 0, save, reload -- verify hidden from pills and menu.html dropdown
6. Verify stock note "(N left)" appears on pills with qty 1-5
7. Verify Options button hidden on menu.html when all variants unavailable/zero-qty
8. Desktop drag reorder -- verify indicator borders, reorder persists after save + reload
9. Mobile touch drag -- verify touch reorder works on handle
10. Add new variation via "+ Add Variation" -- verify all elements and behavior functional
