# UI Component Pattern Library

> Production-quality patterns sourced from award-winning sites, 21st.dev, Aceternity UI, CodePen, Dribbble, Awwwards, CSS-Tricks, Smashing Magazine, MDN, and modern CSS references. Updated March 2026.
>
> **Stack:** Astro 5 + Tailwind CSS 4 + Vanilla JS. All patterns are CSS-first, progressive enhancement.

---

## 1. AI Chat Bubbles / Conversational UI

### 1a. Modern Gradient Chat Bubble

Clean messenger-style bubbles with gradient backgrounds and hover interaction.

```css
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  padding: 20px;
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message.sent {
  flex-direction: row-reverse;
}

.bubble {
  padding: 14px 18px;
  border-radius: 20px;
  max-width: 70%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  line-height: 1.4;
}

.bubble:hover {
  transform: scale(1.02);
}

.message.received .bubble {
  background: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message.sent .bubble {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border-bottom-right-radius: 4px;
}

.timestamp {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
```

```html
<div class="chat-container">
  <div class="message received">
    <img class="avatar" src="avatar.jpg" alt="" />
    <div>
      <div class="bubble">How can I help you today?</div>
      <span class="timestamp">2:34 PM</span>
    </div>
  </div>
  <div class="message sent">
    <div>
      <div class="bubble">I'd like to learn about your services.</div>
      <span class="timestamp">2:35 PM</span>
    </div>
  </div>
</div>
```

### 1b. AI Typing Indicator

Animated dots that indicate the AI is composing a response.

```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 14px 18px;
  background: #f0f0f0;
  border-radius: 20px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
```

```html
<div class="typing-indicator">
  <span></span><span></span><span></span>
</div>
```

### 1c. Floating Chat Widget Entry Point

Bottom-right floating bubble to open/close a chat panel.

```css
.chat-widget-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(110, 142, 251, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 1000;
}

.chat-widget-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(110, 142, 251, 0.6);
}

.chat-widget-trigger svg {
  width: 28px;
  height: 28px;
  fill: white;
}
```

**Sources:** [Subframe CSS Speech Bubbles](https://www.subframe.com/tips/css-speech-bubble-examples), [FreeFrontend CSS Speech Bubbles](https://freefrontend.com/css-speech-bubbles/), [CodePen Simple Chat UI](https://codepen.io/sajadhsm/pen/odaBdd)

---

## 2. Accordions / Collapsible Content

### 2a. Native Details/Summary (Zero JS)

The simplest, most accessible approach using HTML5 elements.

```html
<details class="accordion-item">
  <summary class="accordion-header">What services do you offer?</summary>
  <div class="accordion-body">
    <p>We offer web design, AI integrations, and SEO services.</p>
  </div>
</details>
```

```css
.accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 8px;
  overflow: hidden;
}

.accordion-header {
  padding: 16px 20px;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.accordion-header:hover {
  background: #f9fafb;
}

.accordion-header::after {
  content: "";
  width: 10px;
  height: 10px;
  border-right: 2px solid #6b7280;
  border-bottom: 2px solid #6b7280;
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

details[open] .accordion-header::after {
  transform: rotate(-135deg);
}

.accordion-body {
  padding: 0 20px 16px;
  color: #6b7280;
  line-height: 1.6;
}

/* Animate open/close with calc-size() -- cutting-edge CSS */
details::details-content {
  transition: block-size 0.3s ease, content-visibility 0.3s ease;
  block-size: 0;
  overflow: hidden;
}

details[open]::details-content {
  block-size: calc-size(auto);
}
```

### 2b. Checkbox Hack Accordion (CSS-Only, Full Control)

```html
<div class="accordion">
  <div class="accordion-item">
    <input type="checkbox" id="acc1" class="accordion-toggle">
    <label for="acc1" class="accordion-label">Getting Started</label>
    <div class="accordion-content">
      <p>Content goes here with full styling control.</p>
    </div>
  </div>
</div>
```

```css
.accordion-toggle {
  display: none;
}

.accordion-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s;
}

.accordion-label:hover {
  background: #f3f4f6;
}

.accordion-label::after {
  content: "+";
  font-size: 1.25rem;
  font-weight: 300;
  transition: transform 0.3s ease;
}

.accordion-toggle:checked ~ .accordion-label::after {
  content: "-";
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.4s ease;
  padding: 0 20px;
}

.accordion-toggle:checked ~ .accordion-content {
  max-height: 500px;
  padding: 16px 20px;
}
```

### 2c. Animated Chevron Accordion (Radio Button -- Single Open)

Uses radio buttons so only one section opens at a time.

```html
<div class="accordion-group">
  <div class="accordion-item">
    <input type="radio" name="accordion" id="section1" checked>
    <label for="section1">Section One</label>
    <div class="accordion-panel">
      <p>Only one panel open at a time.</p>
    </div>
  </div>
  <div class="accordion-item">
    <input type="radio" name="accordion" id="section2">
    <label for="section2">Section Two</label>
    <div class="accordion-panel">
      <p>Previous panel closes automatically.</p>
    </div>
  </div>
</div>
```

```css
.accordion-group input[type="radio"] { display: none; }

.accordion-group label {
  display: block;
  padding: 18px 24px;
  background: linear-gradient(to right, #fafafa, #fff);
  border-left: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.accordion-group input:checked ~ label {
  border-left-color: #6e8efb;
  background: #f0f4ff;
}

.accordion-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.accordion-group input:checked ~ .accordion-panel {
  max-height: 300px;
}
```

**Sources:** [Prismic CSS Accordions](https://prismic.io/blog/css-accordions), [FreeFrontend Accordions](https://freefrontend.com/css-accordions/), [CodePen Pure CSS Accordion](https://codepen.io/raubaca/pen/PZzpVe)

---

## 3. Borders / Dividers / Decorative Lines

### 3a. Gradient Fade Divider

```css
.divider-gradient {
  border: none;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    #d1d5db 20%,
    #d1d5db 80%,
    transparent
  );
  margin: 40px 0;
}
```

### 3b. Icon/Text Center Divider

A horizontal line with centered text or icon.

```css
.divider-text {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #9ca3af;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 40px 0;
}

.divider-text::before,
.divider-text::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
```

```html
<div class="divider-text">Or continue with</div>
```

### 3c. Animated Gradient Border

A glowing animated border effect using conic-gradient.

```css
.border-animated {
  position: relative;
  padding: 2px;
  border-radius: 12px;
  background: conic-gradient(
    from var(--angle, 0deg),
    #6e8efb, #a777e3, #f06292, #6e8efb
  );
  animation: rotate-border 3s linear infinite;
}

.border-animated > * {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate-border {
  to { --angle: 360deg; }
}
```

**Sources:** [SliderRevolution CSS Dividers](https://www.sliderrevolution.com/resources/css-dividers/), [FreeFrontend CSS Borders](https://freefrontend.com/css-borders/), [uiCookies CSS Dividers](https://uicookies.com/css-divider/)

---

## 4. Shaders / Gradient Effects / Glassmorphism

### 4a. Standard Glassmorphism Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  padding: 32px;
  color: #fff;
}

/* Requires a colorful background behind the card */
.glass-container {
  background: linear-gradient(135deg, #667eea, #764ba2);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
```

### 4b. Advanced Glass with Combined Filters

```css
.glass-advanced {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px) brightness(1.1) saturate(180%);
  -webkit-backdrop-filter: blur(12px) brightness(1.1) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 40px;
  transition: all 0.3s ease;
}

.glass-advanced:hover {
  backdrop-filter: blur(15px) brightness(1.15) saturate(200%);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(31, 38, 135, 0.5);
}
```

### 4c. Mesh Gradient Background

Modern multi-color gradient used behind glass elements.

```css
.mesh-gradient {
  background-color: #ff99ee;
  background-image:
    radial-gradient(at 40% 20%, #4158d0 0px, transparent 50%),
    radial-gradient(at 80% 0%, #c850c0 0px, transparent 50%),
    radial-gradient(at 0% 50%, #fcb69f 0px, transparent 50%),
    radial-gradient(at 80% 50%, #4facfe 0px, transparent 50%),
    radial-gradient(at 0% 100%, #30cfd0 0px, transparent 50%),
    radial-gradient(at 80% 100%, #a8edea 0px, transparent 50%);
  min-height: 100vh;
}
```

**Sources:** [Glassmorphism Implementation Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide), [css.glass Generator](https://css.glass/), [FreeFrontend Glassmorphism](https://freefrontend.com/css-glassmorphism/)

---

## 5. Badges / Pills / Status Indicators

### 5a. Status Pill System

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  line-height: 1;
  white-space: nowrap;
}

.badge--success {
  background: #dcfce7;
  color: #166534;
}

.badge--warning {
  background: #fef3c7;
  color: #92400e;
}

.badge--danger {
  background: #fce4ec;
  color: #b71c1c;
}

.badge--info {
  background: #e0f2fe;
  color: #075985;
}

.badge--neutral {
  background: #f3f4f6;
  color: #374151;
}
```

### 5b. Badge with Dot Indicator

```css
.badge-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.badge-dot::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.badge-dot.online::before { background: #22c55e; }
.badge-dot.away::before { background: #f59e0b; }
.badge-dot.offline::before { background: #ef4444; }
.badge-dot.busy::before {
  background: #ef4444;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### 5c. Notification Counter Badge

```css
.notification-badge {
  position: relative;
  display: inline-block;
}

.notification-badge::after {
  content: attr(data-count);
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
```

```html
<span class="notification-badge" data-count="3">
  <svg><!-- bell icon --></svg>
</span>
```

**Sources:** [FreeFrontend CSS Badges](https://freefrontend.com/css-badges/), [Bootstrap Badges](https://getbootstrap.com/docs/5.3/components/badge/), [Flowbite Tailwind Badges](https://flowbite.com/docs/components/badge/)

---

## 6. Avatar Styles / User Icons

### 6a. Basic Avatar System with Status

```css
.avatar {
  position: relative;
  display: inline-block;
}

.avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Size variants */
.avatar--sm img { width: 32px; height: 32px; }
.avatar--lg img { width: 64px; height: 64px; }
.avatar--xl img { width: 96px; height: 96px; }

/* Status dot */
.avatar .status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.status.online { background: #22c55e; }
.status.offline { background: #9ca3af; }
.status.busy { background: #ef4444; }
```

### 6b. Initials Avatar (Fallback)

```css
.avatar-initials {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  text-transform: uppercase;
  /* Generate deterministic color from CSS custom property */
  background: var(--avatar-color, #6e8efb);
}
```

```html
<div class="avatar-initials" style="--avatar-color: #3b82f6">EL</div>
<div class="avatar-initials" style="--avatar-color: #10b981">JD</div>
```

### 6c. Stacked Avatar Group

Overlapping avatars for team/member displays.

```css
.avatar-group {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.avatar-group .avatar {
  margin-left: -12px;
  transition: transform 0.2s ease;
}

.avatar-group .avatar:last-child {
  margin-left: 0;
}

.avatar-group .avatar:hover {
  transform: translateY(-4px);
  z-index: 10;
}

.avatar-group .avatar img {
  border: 3px solid #fff;
}

/* "+N more" indicator */
.avatar-group .avatar-more {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-left: -12px;
}
```

**Sources:** [FreeFrontend CSS Avatars](https://freefrontend.com/css-avatars/), [Subframe Avatar Examples](https://www.subframe.com/tips/css-avatar-examples), [Flowbite Tailwind Avatar](https://flowbite.com/docs/components/avatar/)

---

## 7. Pricing Tables / Membership Tiers

### 7a. Three-Tier Pricing Card Layout

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  align-items: start;
}

.pricing-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: #6e8efb;
  box-shadow: 0 8px 30px rgba(110, 142, 251, 0.2);
  position: relative;
  transform: scale(1.05);
}

.pricing-card.featured::before {
  content: "Most Popular";
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  padding: 4px 16px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pricing-price {
  font-size: 3rem;
  font-weight: 800;
  margin: 16px 0;
  color: #111;
}

.pricing-price span {
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 24px 0;
  text-align: left;
}

.pricing-features li {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}

.pricing-features li::before {
  content: "\2713";
  color: #22c55e;
  font-weight: 700;
}

.pricing-cta {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pricing-card .pricing-cta {
  background: #f3f4f6;
  color: #374151;
}

.pricing-card.featured .pricing-cta {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
}

.pricing-cta:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 7b. Monthly/Yearly Toggle Switch

```css
.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.pricing-toggle span {
  font-weight: 500;
  color: #6b7280;
}

.pricing-toggle span.active {
  color: #111;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
}

.toggle-switch input { display: none; }

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #d1d5db;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: #6e8efb;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}
```

**Sources:** [FreeFrontend Pricing Tables](https://freefrontend.com/css-pricing-tables/), [W3Schools Pricing Table](https://www.w3schools.com/howto/howto_css_pricing_table.asp), [Workik Pricing Designs](https://workik.com/pricing-section-design-for-websites-with-html-css-and-javascript-code)

---

## 8. Section Transitions / Dividers

### 8a. SVG Wave Divider

```html
<div class="section section--dark">
  <div class="section__content">Content here</div>
  <div class="section__divider">
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M0,0 C150,90 350,0 500,50 C650,100 800,10 1000,80
               C1100,100 1150,60 1200,80 L1200,120 L0,120 Z"
            fill="#ffffff"/>
    </svg>
  </div>
</div>
```

```css
.section {
  position: relative;
  padding: 80px 0;
}

.section--dark {
  background: #1a1a2e;
  color: #fff;
}

.section__divider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.section__divider svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 80px;
}
```

### 8b. Diagonal Slant Divider (CSS-Only)

```css
.section-slant {
  position: relative;
  padding: 80px 0;
  background: #f9fafb;
}

.section-slant::before {
  content: "";
  position: absolute;
  top: -40px;
  left: 0;
  width: 100%;
  height: 80px;
  background: inherit;
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
}
```

### 8c. Animated Multi-Layer Wave

```css
.wave-container {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  background-size: 50% 100%;
}

.wave--back {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23e0e7ff' d='M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z'/%3E%3C/svg%3E");
  animation: wave-scroll 18s linear infinite;
  opacity: 0.5;
}

.wave--mid {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23c7d2fe' d='M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z'/%3E%3C/svg%3E");
  animation: wave-scroll 12s linear infinite;
  opacity: 0.7;
}

.wave--front {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23818cf8' d='M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z'/%3E%3C/svg%3E");
  animation: wave-scroll 8s linear infinite;
}

@keyframes wave-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Sources:** [SVG Genie Shape Dividers](https://www.svggenie.com/blog/svg-masks-shape-dividers-web-design), [SVG Backgrounds Dividers](https://www.svgbackgrounds.com/elements/svg-shape-dividers/), [CSS Separator Generator](https://codeshack.io/css-separator-generator/)

---

## 9. Navigation Menus

### 9a. Mega Menu with Grid Layout

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 100;
}

.nav__links {
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__item {
  position: relative;
}

.nav__item > a {
  padding: 20px 0;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav__item:hover > a {
  color: #6e8efb;
}

/* Mega dropdown */
.mega-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(3, 200px);
  gap: 24px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.nav__item:hover .mega-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.mega-dropdown__group h4 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 12px;
}

.mega-dropdown__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  transition: background 0.15s;
}

.mega-dropdown__link:hover {
  background: #f3f4f6;
}
```

### 9b. Mobile Bottom Navigation Bar

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #9ca3af;
  font-size: 0.625rem;
  font-weight: 500;
  transition: color 0.2s;
}

.bottom-nav__item.active {
  color: #6e8efb;
}

.bottom-nav__item svg {
  width: 24px;
  height: 24px;
}

/* Hide on desktop */
@media (min-width: 768px) {
  .bottom-nav { display: none; }
}
```

### 9c. Sidebar Navigation with Collapse

```css
.sidebar {
  width: 260px;
  height: 100vh;
  background: #111827;
  color: #d1d5db;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 68px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sidebar__link.active {
  background: rgba(110, 142, 251, 0.15);
  color: #6e8efb;
  border-right: 3px solid #6e8efb;
}

.sidebar__link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar__link span {
  display: none;
}
```

**Sources:** [Prismic CSS Menus](https://prismic.io/blog/css-menus), [FreeFrontend CSS Menus](https://freefrontend.com/css-menu/), [CodePen Responsive Mega Menu](https://codepen.io/arjunamgain/pen/YXBeLJ)

---

## 10. Map Integrations / Location Displays

### 10a. Map Card with Info Overlay

```css
.map-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  height: 400px;
}

.map-card iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.map-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 40px 24px 24px;
  color: white;
}

.map-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.map-card__address {
  font-size: 0.875rem;
  opacity: 0.8;
}
```

### 10b. Location Details Split Layout

```css
.location-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .location-split {
    grid-template-columns: 1fr;
  }
}

.location-split__map {
  min-height: 400px;
}

.location-split__map iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.location-split__info {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  background: #fff;
}

.location-detail {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.location-detail__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6e8efb;
}

.location-detail__text h4 {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.location-detail__text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}
```

### 10c. Custom Map Marker (Google Maps Advanced Markers)

```css
.custom-marker {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 14px;
  font-weight: 700;
  font-size: 0.875rem;
  position: relative;
  white-space: nowrap;
  animation: bounce-drop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.custom-marker::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}

@keyframes bounce-drop {
  0% { transform: translateY(-40px); opacity: 0; }
  60% { transform: translateY(4px); }
  100% { transform: translateY(0); opacity: 1; }
}
```

**Sources:** [Google Maps Advanced Markers](https://developers.google.com/maps/documentation/javascript/examples/advanced-markers-html), [Eleken Map UI Design](https://www.eleken.co/blog-posts/map-ui-design), [UXPin Map UI](https://www.uxpin.com/studio/blog/map-ui/)

---

## 11. Footer Layouts

### 11a. Mega Footer with Newsletter

```css
.footer {
  background: #111827;
  color: #d1d5db;
  padding: 60px 40px 24px;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.footer__brand p {
  color: #9ca3af;
  line-height: 1.6;
  margin: 12px 0 24px;
  max-width: 320px;
}

.footer__heading {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
  margin-bottom: 16px;
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__links li {
  margin-bottom: 10px;
}

.footer__links a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.2s;
}

.footer__links a:hover {
  color: #fff;
}

.footer__newsletter-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.footer__newsletter-input input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #1f2937;
  color: #fff;
  font-size: 0.875rem;
}

.footer__newsletter-input button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #6e8efb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.footer__bottom {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #1f2937;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}
```

### 11b. Minimal Footer

```css
.footer-minimal {
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.footer-minimal__links {
  display: flex;
  gap: 24px;
}

.footer-minimal__links a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-minimal__links a:hover {
  color: #111;
}

@media (max-width: 640px) {
  .footer-minimal {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
```

**Sources:** [Eleken Footer UX Patterns](https://www.eleken.co/blog-posts/footer-ux), [Colorlib Footer Examples](https://colorlib.com/wp/website-footer-examples/), [BeetleBeetle Footer Guide](https://beetlebeetle.com/post/modern-website-footer-design-examples-practices)

---

## 12. Feature Showcases / Benefit Grids

### 12a. Bento Grid Layout

Apple-inspired asymmetric grid for showcasing features.

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.bento-item {
  background: #f9fafb;
  border-radius: 20px;
  padding: 32px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.bento-item:hover {
  transform: translateY(-4px);
}

.bento-item--large {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-item--wide {
  grid-column: span 2;
}

.bento-item--tall {
  grid-row: span 2;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-item--large,
  .bento-item--wide {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-item--large,
  .bento-item--wide {
    grid-column: span 1;
  }

  .bento-item--large {
    grid-row: span 1;
  }
}
```

### 12b. Icon Feature Cards (3-Column)

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 40px 24px;
}

.feature-card__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ede9fe, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6e8efb;
}

.feature-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.feature-card__desc {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.9375rem;
}
```

### 12c. Alternating Feature Rows (Zigzag)

```css
.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-row:nth-child(even) {
  direction: rtl;
}

.feature-row:nth-child(even) > * {
  direction: ltr;
}

.feature-row__image {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.feature-row__image img {
  width: 100%;
  display: block;
}

.feature-row__content h3 {
  font-size: 1.75rem;
  margin-bottom: 16px;
}

.feature-row__content p {
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .feature-row {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .feature-row:nth-child(even) {
    direction: ltr;
  }
}
```

**Sources:** [Senorit Bento Grid Trend](https://senorit.de/en/blog/bento-grid-design-trend-2025), [C# Corner CSS Grid Guide](https://www.c-sharpcorner.com/article/advanced-css-grid-layouts-for-professional-ui-design-2025-guide/), [Modern HTML CSS Showcase](https://delneg.github.io/modern-html-showcase/)

---

## 13. Documentation / Content Layouts

### 13a. Docs Layout with Sidebar + TOC

```css
.docs-layout {
  display: grid;
  grid-template-columns: 260px 1fr 200px;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
}

.docs-sidebar {
  border-right: 1px solid #e5e7eb;
  padding: 24px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.docs-content {
  max-width: 740px;
  margin: 0 auto;
  padding: 40px;
}

.docs-content h1 {
  font-size: 2.25rem;
  margin-bottom: 8px;
}

.docs-content h2 {
  font-size: 1.5rem;
  margin-top: 48px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.docs-content p {
  color: #374151;
  line-height: 1.8;
  margin-bottom: 16px;
}

.docs-content code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
  color: #e11d48;
}

.docs-content pre {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 20px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 20px 0;
  font-size: 0.875rem;
  line-height: 1.7;
}

.docs-toc {
  padding: 24px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  font-size: 0.8125rem;
}

.docs-toc__title {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.6875rem;
  color: #9ca3af;
  margin-bottom: 12px;
}

.docs-toc a {
  display: block;
  padding: 4px 0;
  color: #6b7280;
  text-decoration: none;
  border-left: 2px solid transparent;
  padding-left: 12px;
  transition: all 0.15s;
}

.docs-toc a.active {
  color: #6e8efb;
  border-left-color: #6e8efb;
}
```

### 13b. Prose Typography System

```css
.prose {
  max-width: 65ch;
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #374151;
}

.prose h1 { font-size: 2.25em; margin-top: 0; margin-bottom: 0.8em; }
.prose h2 { font-size: 1.5em; margin-top: 2em; margin-bottom: 0.8em; }
.prose h3 { font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; }

.prose a {
  color: #6e8efb;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose blockquote {
  border-left: 3px solid #6e8efb;
  padding-left: 20px;
  margin-left: 0;
  color: #6b7280;
  font-style: italic;
}

.prose img {
  border-radius: 12px;
  margin: 24px 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}

.prose th, .prose td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.prose th {
  font-weight: 600;
  background: #f9fafb;
}
```

**Sources:** [ThemeFisher Documentation Templates](https://themefisher.com/documentation-website-templates), [UI Bakery CSS Libraries](https://uibakery.io/blog/9-best-css-ui-kits-and-component-libraries-for-2025)

---

## 14. Comparison Tables

### 14a. Feature Comparison with Icons

```css
.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comparison-table thead th {
  background: #111827;
  color: #fff;
  padding: 16px 20px;
  font-weight: 600;
  text-align: center;
}

.comparison-table thead th:first-child {
  text-align: left;
}

.comparison-table tbody td {
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  text-align: center;
}

.comparison-table tbody td:first-child {
  text-align: left;
  font-weight: 500;
  color: #374151;
}

.comparison-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.comparison-table tbody tr:hover {
  background: #f0f4ff;
}

/* Check/X icons via pseudo-elements */
.check::before {
  content: "\2713";
  color: #22c55e;
  font-weight: 700;
  font-size: 1.125rem;
}

.cross::before {
  content: "\2717";
  color: #ef4444;
  font-weight: 700;
  font-size: 1.125rem;
}

/* Highlight recommended column */
.comparison-table .highlight {
  background: rgba(110, 142, 251, 0.05);
  border-left: 2px solid #6e8efb;
  border-right: 2px solid #6e8efb;
}

.comparison-table thead .highlight {
  background: #6e8efb;
}
```

### 14b. Responsive Card-Based Comparison (Mobile)

```css
@media (max-width: 768px) {
  .comparison-table,
  .comparison-table thead,
  .comparison-table tbody,
  .comparison-table th,
  .comparison-table td,
  .comparison-table tr {
    display: block;
  }

  .comparison-table thead {
    display: none;
  }

  .comparison-table tr {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .comparison-table td {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    text-align: right;
  }

  .comparison-table td::before {
    content: attr(data-label);
    font-weight: 600;
    text-align: left;
  }
}
```

**Sources:** [W3Schools Comparison Table](https://www.w3schools.com/howto/howto_css_comparison_table.asp), [CodyHouse Products Comparison](https://codyhouse.co/gem/products-comparison-table/), [DEV Community Responsive Tables](https://dev.to/satyam_gupta_0d1ff2152dcc/css-responsive-tables-complete-guide-with-code-examples-for-2025-225p)

---

## 15. Client Logos / Partner Strips

### 15a. CSS-Only Infinite Scroll Carousel

No JavaScript required. Duplicate the logo set for seamless looping.

```css
.logo-carousel {
  overflow: hidden;
  position: relative;
  padding: 40px 0;
  background: #fafafa;
}

/* Fade edges */
.logo-carousel::before,
.logo-carousel::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 2;
}

.logo-carousel::before {
  left: 0;
  background: linear-gradient(to right, #fafafa, transparent);
}

.logo-carousel::after {
  right: 0;
  background: linear-gradient(to left, #fafafa, transparent);
}

.logo-track {
  display: flex;
  animation: scroll-logos 30s linear infinite;
  width: max-content;
}

.logo-track:hover {
  animation-play-state: paused;
}

.logo-item {
  flex: 0 0 auto;
  width: 180px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-item img {
  max-width: 120px;
  max-height: 40px;
  filter: grayscale(100%);
  opacity: 0.5;
  transition: all 0.3s;
}

.logo-item img:hover {
  filter: grayscale(0%);
  opacity: 1;
}

@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

```html
<div class="logo-carousel">
  <div class="logo-track">
    <!-- Original set -->
    <div class="logo-item"><img src="logo1.svg" alt="Client 1"></div>
    <div class="logo-item"><img src="logo2.svg" alt="Client 2"></div>
    <div class="logo-item"><img src="logo3.svg" alt="Client 3"></div>
    <!-- Duplicate set for seamless loop -->
    <div class="logo-item"><img src="logo1.svg" alt="Client 1"></div>
    <div class="logo-item"><img src="logo2.svg" alt="Client 2"></div>
    <div class="logo-item"><img src="logo3.svg" alt="Client 3"></div>
  </div>
</div>
```

### 15b. Static Logo Grid with Hover Reveal

```css
.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  align-items: center;
  justify-items: center;
  padding: 40px;
}

.logo-grid img {
  max-width: 120px;
  max-height: 48px;
  filter: grayscale(100%);
  opacity: 0.4;
  transition: all 0.3s ease;
}

.logo-grid img:hover {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}
```

**Sources:** [getButterfly CSS Logo Carousel](https://getbutterfly.com/fast-and-accessible-css-only-client-logo-carousel/), [BootstrapBrain Logo Carousel](https://bootstrapbrain.com/component/bootstrap-5-client-or-partner-logo-carousel/), [CodePen Client Logo Slider](https://codepen.io/mdashikar/pen/VWPvgE)

---

## 16. CTA Sections

### 16a. Split CTA (Text + Visual)

```css
.cta-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  overflow: hidden;
  max-width: 1100px;
  margin: 60px auto;
}

.cta-split__content {
  padding: 60px;
  color: #fff;
}

.cta-split__content h2 {
  font-size: 2rem;
  margin-bottom: 16px;
}

.cta-split__content p {
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 32px;
}

.cta-split__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .cta-split {
    grid-template-columns: 1fr;
  }
}
```

### 16b. Floating Sticky CTA Bar

```css
.cta-sticky {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.cta-sticky.visible {
  transform: translateY(0);
}

.cta-sticky__text {
  font-weight: 600;
  color: #111;
}

.cta-sticky__button {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: #6e8efb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
```

### 16c. Inline Banner CTA

```css
.cta-inline {
  background: linear-gradient(135deg, #ede9fe, #e0e7ff);
  border-radius: 16px;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 40px 0;
}

.cta-inline__text h3 {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.cta-inline__text p {
  color: #6b7280;
  margin: 0;
}

.cta-inline__button {
  padding: 12px 28px;
  border-radius: 10px;
  border: none;
  background: #6e8efb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s;
}

.cta-inline__button:hover {
  transform: scale(1.05);
}

@media (max-width: 640px) {
  .cta-inline {
    flex-direction: column;
    text-align: center;
  }
}
```

**Sources:** [Tailwind CTA Sections](https://tailwindcss.com/plus/ui-blocks/marketing/sections/cta-sections), [LandingPageFlow CTA Placement](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages), [RebelMouse Sticky Positions](https://www.rebelmouse.com/css-position-sticky)

---

## 17. Carousel / Slider Patterns

### 17a. Modern CSS Scroll-Snap Carousel

Native CSS carousel using scroll-snap. No JavaScript.

```css
.carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 20px;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel__slide {
  flex: 0 0 calc(100% - 40px);
  scroll-snap-align: center;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* Show multiple slides on wider screens */
@media (min-width: 768px) {
  .carousel__slide {
    flex: 0 0 calc(50% - 24px);
  }
}

@media (min-width: 1024px) {
  .carousel__slide {
    flex: 0 0 calc(33.333% - 24px);
  }
}
```

### 17b. CSS-Only Carousel with Scroll Markers (Cutting Edge)

Uses new CSS `::scroll-marker` pseudo-elements for pagination dots.

```css
.carousel-modern {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  scroll-marker-group: after;
}

.carousel-modern::-webkit-scrollbar { display: none; }

.carousel-modern::scroll-marker-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 16px;
}

.carousel-modern > * {
  flex: 0 0 100%;
  scroll-snap-align: center;
}

.carousel-modern > *::scroll-marker {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: none;
  cursor: pointer;
}

.carousel-modern > *::scroll-marker:target-current {
  background: #6e8efb;
}

/* Scroll buttons */
.carousel-modern::scroll-button(left) {
  content: url("data:image/svg+xml,...");
}

.carousel-modern::scroll-button(right) {
  content: url("data:image/svg+xml,...");
}
```

### 17c. Testimonial Card Slider

```css
.testimonial-carousel {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 20px;
  scrollbar-width: none;
}

.testimonial-card {
  flex: 0 0 min(400px, 85vw);
  scroll-snap-align: start;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.testimonial-card__stars {
  color: #f59e0b;
  font-size: 1.25rem;
  letter-spacing: 2px;
}

.testimonial-card__quote {
  color: #374151;
  line-height: 1.7;
  flex: 1;
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-card__author img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-card__name {
  font-weight: 600;
  font-size: 0.9375rem;
}

.testimonial-card__role {
  font-size: 0.8125rem;
  color: #6b7280;
}
```

**Sources:** [MDN CSS Carousels](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Overflow/Carousels), [Prismic CSS Sliders](https://prismic.io/blog/css-sliders), [CSS-Tricks Carousel](https://css-tricks.com/css-only-carousel/)

---

## 18. Checkbox / Toggle Custom Styles

### 18a. iOS-Style Toggle Switch

```html
<label class="toggle">
  <input type="checkbox">
  <span class="toggle__slider"></span>
</label>
```

```css
.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle__slider {
  position: absolute;
  inset: 0;
  background: #d1d5db;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle__slider::before {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle__slider {
  background: #6e8efb;
}

input:checked + .toggle__slider::before {
  transform: translateX(24px);
}

input:focus-visible + .toggle__slider {
  outline: 2px solid #6e8efb;
  outline-offset: 2px;
}
```

### 18b. Custom Checkbox with Animation

```css
.checkbox-custom {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-custom input {
  display: none;
}

.checkbox-custom__box {
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-custom input:checked ~ .checkbox-custom__box {
  background: #6e8efb;
  border-color: #6e8efb;
}

.checkbox-custom__box::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.2s ease;
}

.checkbox-custom input:checked ~ .checkbox-custom__box::after {
  transform: rotate(45deg) scale(1);
}
```

### 18c. Dark Mode Toggle (Sun/Moon)

```css
.theme-toggle {
  width: 64px;
  height: 32px;
  border-radius: 16px;
  background: #1e293b;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border: none;
  transition: background 0.4s;
}

.theme-toggle.light {
  background: #bfdbfe;
}

.theme-toggle::before {
  content: "";
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  top: 4px;
  left: 4px;
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
  transition: transform 0.4s ease, background 0.4s;
}

.theme-toggle.light::before {
  transform: translateX(32px);
  background: #fff;
  box-shadow: inset -4px -2px 0 0 #cbd5e1;
}
```

**Sources:** [W3Schools Toggle Switch](https://www.w3schools.com/howto/howto_css_switch.asp), [LambdaTest CSS Toggle Switches](https://www.lambdatest.com/blog/css-toggle-switches/), [FreeFrontend CSS Checkboxes](https://freefrontend.com/css-checkboxes/)

---

## 19. Date Picker Designs

### 19a. Minimal Date Input Styling

Override the native `<input type="date">` appearance.

```css
.date-input {
  appearance: none;
  -webkit-appearance: none;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #374151;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
  width: 100%;
}

.date-input:focus {
  outline: none;
  border-color: #6e8efb;
  box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.15);
}

/* Hide default calendar icon and use custom */
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.date-wrapper {
  position: relative;
}

.date-wrapper::after {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E");
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
```

### 19b. Calendar Grid Component

CSS for a custom calendar layout (pair with JS for functionality).

```css
.calendar {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 24px;
  width: 320px;
}

.calendar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar__header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.calendar__header button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.calendar__header button:hover {
  background: #f3f4f6;
}

.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar__weekdays span {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
}

.calendar__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
  border: none;
  background: none;
}

.calendar__day:hover {
  background: #f3f4f6;
}

.calendar__day.today {
  background: #e0e7ff;
  color: #6e8efb;
  font-weight: 600;
}

.calendar__day.selected {
  background: #6e8efb;
  color: #fff;
  font-weight: 600;
}

.calendar__day.other-month {
  color: #d1d5db;
}

/* Date range selection */
.calendar__day.in-range {
  background: #ede9fe;
  border-radius: 0;
}

.calendar__day.range-start {
  border-radius: 8px 0 0 8px;
}

.calendar__day.range-end {
  border-radius: 0 8px 8px 0;
}
```

**Sources:** [Modern UI Date Picker](https://modern-ui.org/docs/components/date-picker), [Flowbite Datepicker](https://flowbite.com/docs/components/datepicker/), [W3C Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)

---

## 20. Dropdown / Select Menus

### 20a. Pure CSS Custom Select

Reset native select styling and apply custom design.

```css
:root {
  --select-border: #d1d5db;
  --select-focus: #6e8efb;
  --select-arrow: #6b7280;
}

.select-wrapper {
  width: 100%;
  min-width: 15ch;
  border: 1px solid var(--select-border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.9375rem;
  cursor: pointer;
  line-height: 1.1;
  background-color: #fff;
  display: grid;
  grid-template-areas: "select";
  align-items: center;
  position: relative;
}

.select-wrapper select {
  appearance: none;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
  font-family: inherit;
  font-size: inherit;
  cursor: inherit;
  line-height: inherit;
  outline: none;
  grid-area: select;
}

/* Custom arrow using clip-path */
.select-wrapper::after {
  content: "";
  width: 10px;
  height: 6px;
  background-color: var(--select-arrow);
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
  grid-area: select;
  justify-self: end;
}

.select-wrapper:focus-within {
  border-color: var(--select-focus);
  box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.15);
}
```

```html
<div class="select-wrapper">
  <select>
    <option value="">Choose an option</option>
    <option value="1">Option One</option>
    <option value="2">Option Two</option>
    <option value="3">Option Three</option>
  </select>
</div>
```

### 20b. Custom Dropdown with Animation

Built from scratch (requires minimal JS for open/close toggle).

```css
.dropdown {
  position: relative;
  width: 100%;
}

.dropdown__trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.dropdown__trigger:hover {
  border-color: #9ca3af;
}

.dropdown__trigger svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.dropdown.open .dropdown__trigger {
  border-color: #6e8efb;
  box-shadow: 0 0 0 3px rgba(110, 142, 251, 0.15);
}

.dropdown.open .dropdown__trigger svg {
  transform: rotate(180deg);
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease;
  z-index: 50;
  max-height: 240px;
  overflow-y: auto;
}

.dropdown.open .dropdown__menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown__option {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.9375rem;
}

.dropdown__option:hover {
  background: #f3f4f6;
}

.dropdown__option.selected {
  background: #e0e7ff;
  color: #6e8efb;
  font-weight: 500;
}
```

### 20c. Searchable Select Dropdown

```css
.dropdown__search {
  padding: 8px 12px;
  margin-bottom: 4px;
  position: sticky;
  top: 0;
  background: #fff;
}

.dropdown__search input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.dropdown__search input:focus {
  border-color: #6e8efb;
}

.dropdown__no-results {
  padding: 16px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}
```

**Sources:** [ModernCSS Custom Select](https://moderncss.dev/custom-select-styles-with-pure-css/), [LogRocket Custom Select](https://blog.logrocket.com/creating-custom-select-dropdown-css/), [FreeFrontend Select Boxes](https://freefrontend.com/css-select-boxes/)

---

## 21. Button Styles & Hover Effects

### 21a. Liquid Fill Button

Background color fills from bottom on hover. Pure CSS.

```css
.liquid-button {
  position: relative;
  padding: 1rem 2rem;
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.liquid-button::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: var(--color-primary);
  transition: height 0.3s ease;
  z-index: -1;
}

.liquid-button:hover::before { height: 100%; }
.liquid-button:hover { color: #000; }
```

### 21b. Gradient Shift Button

```css
.gradient-shift-button {
  padding: 1rem 2rem;
  border: none;
  background: linear-gradient(90deg, var(--color-primary), #ff0080, var(--color-primary));
  background-size: 200% 100%;
  background-position: 0% 0%;
  color: #000;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.gradient-shift-button:hover {
  background-position: 100% 0%;
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.4);
}
```

### 21c. Arrow Slide Button

```css
.arrow-slide-button {
  padding: 1rem 2rem;
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.arrow-slide-button .arrow {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateX(-10px);
  opacity: 0;
}

.arrow-slide-button:hover .arrow {
  transform: translateX(0);
  opacity: 1;
}
```

### 21d. Moving Border Button (Aceternity UI)

Conic gradient rotates around button border.

```css
@keyframes rotate-border {
  0% { transform: rotate(0deg) scale(10); }
  100% { transform: rotate(-360deg) scale(10); }
}

.moving-border-btn {
  position: relative;
  padding: 1rem 2rem;
  border-radius: 8px;
  overflow: hidden;
  z-index: 0;
}

.moving-border-btn::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, #0ea5e9 20deg, transparent 120deg);
  animation: rotate-border 10s linear infinite;
  z-index: -2;
}

.moving-border-btn::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  background: var(--color-background);
  z-index: -1;
}
```

### 21e. Shimmer Button

```css
@keyframes shimmer {
  0% { background-position: 0 0; }
  100% { background-position: -200% 0; }
}

.shimmer-button {
  background: linear-gradient(110deg, var(--color-primary) 0%, rgba(255,255,255,0.3) 30%, var(--color-primary) 60%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 1rem 2rem;
}
```

### 21f. Sketch / Brutalist Button

```html
<button class="px-4 py-2 rounded-md border-2 border-black bg-white text-black text-sm font-bold
               hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition-shadow">
  Click Me
</button>
```

### 21g. Glow Pulse Button

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5), 0 0 10px rgba(var(--color-primary-rgb), 0.3); }
  50% { box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.8), 0 0 25px rgba(var(--color-primary-rgb), 0.5); }
}

.glow-pulse-button {
  background: var(--color-primary);
  color: #000;
  border: none;
  font-weight: 600;
  border-radius: 4px;
  padding: 1rem 2rem;
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### 21h. Magnetic Button (Cursor Follow)

```js
document.querySelectorAll('[data-magnetic]').forEach(button => {
  button.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const distX = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const distY = (e.clientY - rect.top - rect.height / 2) * 0.2;
    this.style.transform = `translate(${distX}px, ${distY}px)`;
  });
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translate(0, 0)';
  });
});
```

### 21i. Border Reveal Button

```css
.border-reveal {
  position: relative;
  padding: 1rem 2rem;
  background: transparent;
  color: var(--color-primary);
  border: none;
  font-weight: 600;
}

.border-reveal::before, .border-reveal::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  transition: width 0.3s ease, height 0.3s ease;
}

.border-reveal::before {
  top: 0; left: 0;
  border-top: 2px solid var(--color-primary);
  border-left: 2px solid var(--color-primary);
}

.border-reveal::after {
  bottom: 0; right: 0;
  border-bottom: 2px solid var(--color-primary);
  border-right: 2px solid var(--color-primary);
  transition-delay: 0.15s;
}

.border-reveal:hover::before, .border-reveal:hover::after {
  width: 100%;
  height: 100%;
}
```

---

## 22. Form Elements

### 22a. Floating Label Input (CSS-only)

```css
.float-group { position: relative; margin-bottom: 1.5rem; }

.float-group input {
  width: 100%;
  padding: 1rem 0.75rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: transparent;
  transition: border-color 0.2s;
}

.float-group label {
  position: absolute;
  top: 50%; left: 0.75rem;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #9ca3af;
  pointer-events: none;
  transition: all 0.2s ease;
  background: white;
  padding: 0 4px;
}

.float-group input:focus + label,
.float-group input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 0.75rem;
  color: var(--color-primary);
}
```

### 22b. Underline-Only Inputs

```css
.input-underline {
  width: 100%;
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: inherit;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-underline:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}
```

### 22c. Inline Validation States

```css
input:valid { border-color: #10b981; }
input:invalid:not(:placeholder-shown) { border-color: #ef4444; }
input:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
input[type="checkbox"], input[type="radio"], input[type="range"], progress { accent-color: var(--color-primary); }
```

### 22d. Password Strength Indicator

```css
.strength-bar { height: 4px; border-radius: 2px; transition: width 0.3s ease, background-color 0.3s ease; }
.strength-weak   { width: 25%; background: #ef4444; }
.strength-fair   { width: 50%; background: #f59e0b; }
.strength-good   { width: 75%; background: #3b82f6; }
.strength-strong { width: 100%; background: #10b981; }
```

---

## 23. File Upload Patterns

### 23a. Drag-and-Drop Zone

```css
.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.drop-zone.dragover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
  transform: scale(1.02);
}
```

---

## 24. Slider / Range Input Patterns

### 24a. Custom Range Slider

```css
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%; height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: transform 0.15s ease;
}

input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
```

### 24b. Before/After Image Comparison Slider

```js
const slider = document.querySelector('.comparison-slider input');
const overlay = document.querySelector('.after-overlay');
const divider = document.querySelector('.divider-line');

slider.addEventListener('input', (e) => {
  overlay.style.width = e.target.value + '%';
  divider.style.left = e.target.value + '%';
});
```

---

## 25. Radio Group Patterns

### 25a. Card-Style Radio Selection

```css
.radio-card {
  border: 2px solid #d1d5db;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-card:has(input:checked) {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
}

.radio-card input[type="radio"] { position: absolute; opacity: 0; }
```

### 25b. Button-Group Radio

```html
<div class="inline-flex rounded-lg border overflow-hidden">
  <label class="px-4 py-2 cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-white transition-colors">
    <input type="radio" name="view" value="grid" class="sr-only" checked /> Grid
  </label>
  <label class="px-4 py-2 cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-white transition-colors border-l">
    <input type="radio" name="view" value="list" class="sr-only" /> List
  </label>
</div>
```

---

## 26. Tab Patterns

### 26a. Animated Pill Tab

```css
.tab-bar { display: flex; gap: 4px; background: #f3f4f6; border-radius: 9999px; padding: 4px; position: relative; }
.tab-item { padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 500; color: #6b7280; cursor: pointer; transition: color 0.3s; z-index: 1; }
.tab-item.active { color: white; }
.tab-indicator { position: absolute; height: calc(100% - 8px); top: 4px; background: var(--color-primary); border-radius: 9999px; transition: left 0.3s ease, width 0.3s ease; z-index: 0; }
```

### 26b. Vertical Tabs

```css
.vtab-btn { display: block; width: 100%; text-align: left; padding: 0.75rem 1rem; border-left: 3px solid transparent; color: #6b7280; transition: all 0.2s; }
.vtab-btn.active { border-left-color: var(--color-primary); background: rgba(var(--color-primary-rgb), 0.05); color: var(--color-foreground); font-weight: 600; }
```

---

## 27. Pagination

### 27a. Numbered Pagination

```html
<nav class="flex items-center gap-1">
  <button class="px-3 py-2 rounded text-sm text-muted hover:bg-surface">&laquo;</button>
  <button class="px-3 py-2 rounded text-sm bg-primary text-white font-semibold">1</button>
  <button class="px-3 py-2 rounded text-sm text-foreground hover:bg-surface">2</button>
  <button class="px-3 py-2 rounded text-sm text-foreground hover:bg-surface">3</button>
  <button class="px-3 py-2 rounded text-sm text-muted hover:bg-surface">&raquo;</button>
</nav>
```

---

## 28. Dialog / Modal Patterns

### 28a. Center Modal (Fade + Scale)

```css
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 9999; }
.modal-overlay.open { opacity: 1; visibility: visible; }
.modal-content { background: white; border-radius: 12px; max-width: 500px; width: 90%; padding: 2rem; transform: scale(0.95); transition: transform 0.3s ease; }
.modal-overlay.open .modal-content { transform: scale(1); }
```

### 28b. Bottom Sheet (Mobile)

```css
.bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 16px 16px 0 0; padding: 1.5rem; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10000; max-height: 80vh; overflow-y: auto; }
.bottom-sheet.open { transform: translateY(0); }
.bottom-sheet::before { content: ''; display: block; width: 36px; height: 4px; background: #d1d5db; border-radius: 2px; margin: 0 auto 1rem; }
```

### 28c. Native Dialog Element

```html
<dialog id="my-dialog" class="rounded-xl shadow-2xl p-8 backdrop:bg-black/50 max-w-md w-full border-none">
  <h2 class="text-xl font-bold mb-4">Confirm Action</h2>
  <p class="text-gray-600 mb-6">Are you sure?</p>
  <form method="dialog" class="flex gap-3 justify-end">
    <button value="cancel" class="px-4 py-2 text-gray-600">Cancel</button>
    <button value="confirm" class="px-4 py-2 bg-primary text-white rounded-lg">Confirm</button>
  </form>
</dialog>
```

---

## 29. Toast / Notification Patterns

### 29a. Slide-In Toast with Auto-Dismiss

```css
@keyframes toast-slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes toast-slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

.toast-container { position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.75rem; }
.toast { display: flex; align-items: center; gap: 0.75rem; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 1rem; min-width: 320px; animation: toast-slide-in 0.3s ease-out; }
.toast.removing { animation: toast-slide-out 0.3s ease-in; }

.toast-success { border-left: 4px solid #10b981; }
.toast-error   { border-left: 4px solid #ef4444; }
.toast-warning { border-left: 4px solid #f59e0b; }
.toast-info    { border-left: 4px solid #3b82f6; }
```

```js
function showToast(message, type = 'success', duration = 4000) {
  const container = document.querySelector('.toast-container')
    || Object.assign(document.createElement('div'), { className: 'toast-container' });
  if (!container.parentNode) document.body.appendChild(container);

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  const msg = document.createElement('span');
  msg.textContent = message;
  toast.appendChild(msg);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.addEventListener('click', () => toast.remove());
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

### 29b. Progress Toast

```css
.toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--color-primary); border-radius: 0 0 0 8px; animation: progress-shrink var(--duration, 4s) linear forwards; }
@keyframes progress-shrink { from { width: 100%; } to { width: 0%; } }
.toast:hover .toast-progress { animation-play-state: paused; }
```

---

## 30. Tooltip Patterns

### 30a. CSS-Only Tooltip

```css
[data-tooltip] { position: relative; cursor: help; }

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  padding: 6px 12px; background: #1f2937; color: white; font-size: 12px; border-radius: 6px; white-space: nowrap;
  opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; pointer-events: none; z-index: 999;
}

[data-tooltip]::before {
  content: ''; position: absolute; bottom: calc(100% + 2px); left: 50%; transform: translateX(-50%);
  border: 5px solid transparent; border-top-color: #1f2937;
  opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; pointer-events: none;
}

[data-tooltip]:hover::after, [data-tooltip]:hover::before { opacity: 1; visibility: visible; }
```

---

## 31. Popover Patterns

### 31a. Click-Triggered Popover

```css
.popover {
  position: absolute; bottom: calc(100% + 12px); left: 50%;
  transform: translateX(-50%) scale(0.95);
  background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 1rem; min-width: 250px; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 999;
}

.popover.open { opacity: 1; visibility: visible; transform: translateX(-50%) scale(1); }

.popover::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 8px solid transparent; border-top-color: white;
}
```

---

## 32. Icon Hover Effects

### 32a. Scale + Color Shift

```css
.icon-hover { color: #6b7280; transition: all 0.2s ease; }
.icon-hover:hover { color: var(--color-primary); transform: scale(1.2); }
```

### 32b. Hamburger to Close Morph

```css
.hamburger span { display: block; height: 2px; width: 100%; background: currentColor; position: absolute; transition: all 0.3s ease; }
.hamburger span:nth-child(1) { top: 0; }
.hamburger span:nth-child(2) { top: 8px; }
.hamburger span:nth-child(3) { top: 16px; }
.hamburger.open span:nth-child(1) { top: 8px; transform: rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { top: 8px; transform: rotate(-45deg); }
```

---

## 33. Tag / Badge Patterns

### 33a. Removable Pill Tags

```html
<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
  Design <button class="ml-1 hover:text-red-500">&times;</button>
</span>
```

### 33b. Notification Badge with Ping

```html
<div class="relative inline-block">
  <button class="p-2"><svg class="w-6 h-6"><!-- icon --></svg></button>
  <span class="absolute top-0 right-0 flex h-4 w-4">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[10px] text-white font-bold">3</span>
  </span>
</div>
```

### 33c. Status Badge

```html
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium">
  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
</span>
```

---

## 34. Table Patterns

### 34a. Sticky Header Table

```css
.table-container { overflow-x: auto; max-height: 500px; overflow-y: auto; }
.table-container thead th { position: sticky; top: 0; background: white; z-index: 10; box-shadow: 0 1px 0 #e5e7eb; }
.table-container tbody tr:nth-child(even) { background: #f9fafb; }
.table-container tbody tr:hover { background: rgba(var(--color-primary-rgb), 0.05); }
```

### 34b. Expandable Rows

```css
.expandable-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.expandable-content.open { max-height: 300px; }
.expand-chevron { transition: transform 0.3s ease; }
.expand-chevron.open { transform: rotate(180deg); }
```

---

## 35. Empty States & Skeleton Screens

### 35a. Skeleton Loading with Shimmer

```css
@keyframes skeleton-shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }

.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 1000px 100%;
  animation: skeleton-shimmer 2s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-text { height: 16px; margin-bottom: 8px; }
.skeleton-text:last-child { width: 70%; }
.skeleton-circle { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-image { width: 100%; height: 200px; border-radius: 8px; }
```

---

## 36. File Tree Patterns

### 36a. Expandable Tree View

```css
.tree-item { padding-left: 1.5rem; position: relative; }
.tree-item::before { content: ''; position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 1px; background: #e5e7eb; }
.tree-toggle .chevron { display: inline-block; transition: transform 0.2s ease; font-size: 0.75rem; }
.tree-toggle.open .chevron { transform: rotate(90deg); }
.tree-children { display: none; }
.tree-toggle.open + .tree-children { display: block; }
```

---

## 37. Spinner / Loader Patterns

### 37a. Border Spinner

```css
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

### 37b. Bouncing Dots

```css
.dot-loader { display: flex; gap: 6px; }
.dot-loader span { width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%; animation: dot-bounce 1.4s infinite ease-in-out; }
.dot-loader span:nth-child(2) { animation-delay: 0.16s; }
.dot-loader span:nth-child(3) { animation-delay: 0.32s; }
@keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
```

---

## 38. Number Styles & Animated Counters

### 38a. Count-Up Animation (IntersectionObserver)

```js
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  function update() {
    start += increment;
    if (start >= target) { el.textContent = target.toLocaleString(); return; }
    el.textContent = Math.floor(start).toLocaleString();
    requestAnimationFrame(update);
  }
  update();
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target, parseInt(entry.target.dataset.target));
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
```

### 38b. CSS @property Counter (Chrome)

```css
@property --num { syntax: '<integer>'; initial-value: 0; inherits: false; }
.css-counter { counter-reset: num var(--num); animation: count-up 2s ease-out forwards; font-variant-numeric: tabular-nums; }
.css-counter::after { content: counter(num); }
@keyframes count-up { to { --num: 500; } }
```

---

## 39. Sign In / Sign Up Forms

### 39a. Login Card

```html
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
  <h2 class="text-2xl font-bold text-center mb-6">Sign In</h2>
  <form class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <input type="password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
    </div>
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="accent-primary" /> Remember me</label>
      <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
    </div>
    <button class="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light">Sign In</button>
  </form>
</div>
```

### 39b. OTP Input Fields

```css
.otp-input { width: 48px; height: 56px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 2px solid #d1d5db; border-radius: 8px; transition: border-color 0.2s; }
.otp-input:focus { border-color: var(--color-primary); outline: none; box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15); }
```

---

## 40. Link Hover Effects

### 40a. Animated Underline (Left to Right)

```css
.link-underline { position: relative; text-decoration: none; }
.link-underline::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: currentColor; transition: width 0.3s ease; }
.link-underline:hover::after { width: 100%; }
```

### 40b. Gradient Underline

```css
.link-gradient {
  text-decoration: none;
  background-image: linear-gradient(90deg, var(--color-primary), #8b5cf6);
  background-size: 0 2px;
  background-position: left bottom;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
  padding-bottom: 2px;
}
.link-gradient:hover { background-size: 100% 2px; }
```

---

## 41. Mega Menu Navigation

```css
.mega-menu {
  position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(-8px);
  width: 600px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  padding: 2rem; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 100;
}
.mega-menu-trigger:hover .mega-menu, .mega-menu-trigger:focus-within .mega-menu {
  opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0);
}
.mega-menu-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; transition: background 0.15s; }
.mega-menu-item:hover { background: #f9fafb; }
```

---

## 42. Scroll Progress Indicator

```css
.scroll-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--color-primary), #8b5cf6); width: 0%; z-index: 99999; }
```

```js
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  document.querySelector('.scroll-progress').style.width = pct + '%';
});
```

---

## 43. Text Animation Effects

### 43a. Typewriter (CSS-only)

```css
.typewriter { overflow: hidden; border-right: 0.15em solid var(--color-primary); white-space: nowrap; animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite; }
@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes blink-caret { from, to { border-color: transparent; } 50% { border-color: var(--color-primary); } }
```

### 43b. Animated Gradient Text

```css
.gradient-text { background: linear-gradient(90deg, var(--color-primary), #ff0080, var(--color-primary)); background-size: 200% 200%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-text-flow 3s ease infinite; }
@keyframes gradient-text-flow { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
```

### 43c. Word Rotation

```css
.word-rotate { display: inline-block; overflow: hidden; height: 1.2em; vertical-align: bottom; }
.word-rotate span { display: block; animation: rotate-words 9s infinite ease-in-out; opacity: 0; }
.word-rotate span:nth-child(1) { animation-delay: 0s; }
.word-rotate span:nth-child(2) { animation-delay: 3s; }
.word-rotate span:nth-child(3) { animation-delay: 6s; }
@keyframes rotate-words { 0% { opacity: 0; transform: translateY(50%); } 5% { opacity: 1; transform: translateY(0); } 28% { opacity: 1; transform: translateY(0); } 33% { opacity: 0; transform: translateY(-50%); } 100% { opacity: 0; } }
```

---

## 44. Confetti / Celebration Effects

```js
function celebrate() {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = 'position:fixed;top:-10px;pointer-events:none;animation:confetti-fall 3s ease-in-out forwards;';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = piece.style.height = (Math.random() * 8 + 4) + 'px';
    piece.style.animationDelay = Math.random() * 0.3 + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3300);
  }
}
```

```css
@keyframes confetti-fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
```

---

## 45. Sticky Floating CTA

```css
.sticky-cta { position: fixed; bottom: 30px; right: 30px; z-index: 999; background: var(--color-primary); color: white; border: none; padding: 1rem 1.5rem; border-radius: 50px; font-weight: 600; box-shadow: 0 10px 30px rgba(var(--color-primary-rgb), 0.3); transition: all 0.3s ease; animation: float-up 0.5s ease-out; }
@keyframes float-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.sticky-cta:hover { transform: scale(1.1); }
@media (max-width: 480px) { .sticky-cta { display: none; } }
```

---

## 46. CSS Scroll-Snap Carousel

```css
.snap-carousel { display: flex; overflow-x: scroll; scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 1rem; }
.snap-carousel::-webkit-scrollbar { display: none; }
.snap-card { flex: 0 0 min(350px, 85vw); scroll-snap-align: start; scroll-snap-stop: always; }
```

---

## 47. Aurora / Mesh Gradient Backgrounds

### 47a. Animated Aurora

```css
.aurora-bg { background: linear-gradient(135deg, var(--color-primary) 0%, #1a0033 25%, #ff0080 50%, #1a0033 75%, var(--color-primary) 100%); background-size: 400% 400%; animation: aurora-flow 8s ease infinite; }
@keyframes aurora-flow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
```

### 47b. Mesh Gradient (Stacked Radials)

```css
.mesh-gradient { background: radial-gradient(circle at 20% 30%, rgba(var(--color-primary-rgb), 0.3), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 0, 128, 0.3), transparent 50%), radial-gradient(circle at 50% 50%, rgba(100, 50, 255, 0.2), transparent 50%), linear-gradient(135deg, #1a1a2e, #0f3460); }
```

### 47c. Glassmorphism Card

```css
.glass-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37); }
```

Tailwind: `bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl`

---

## 48. Neon Glow Effects

```css
.neon-border { border: 2px solid var(--color-primary); box-shadow: 0 0 5px var(--color-primary), 0 0 10px var(--color-primary); }
.neon-border:hover { box-shadow: 0 0 10px var(--color-primary), 0 0 20px var(--color-primary), 0 0 30px var(--color-primary); }

.neon-text { color: var(--color-primary); text-shadow: 0 0 7px var(--color-primary), 0 0 10px var(--color-primary), 0 0 21px var(--color-primary); }
```

---

## 49. Clip-Path Reveal Animations

```css
@keyframes reveal-circle { from { clip-path: circle(0% at center); } to { clip-path: circle(100% at center); } }
.clip-reveal-circle { animation: reveal-circle 0.8s ease-out forwards; }

@keyframes reveal-polygon { from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
.clip-reveal-wipe { animation: reveal-polygon 0.8s ease-out forwards; }

.diagonal-top { clip-path: polygon(0 8%, 100% 0, 100% 100%, 0 100%); }
.diagonal-bottom { clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%); }
```

---

## 50. Parallax Scroll Patterns

```css
.parallax-band { background-attachment: fixed; background-position: center; background-size: cover; min-height: 400px; }
@supports not (background-attachment: fixed) { .parallax-band { background-attachment: scroll; } }
```

Modern (Chrome/Edge):

```css
.parallax-modern { background: url('bg.jpg') center/cover; animation: parallax-shift linear; animation-timeline: scroll(); }
@keyframes parallax-shift { to { background-position: bottom -400px center; } }
@media (prefers-reduced-motion: reduce) { .parallax-modern { animation: none; } }
```

---

## 51. Infinite Scrolling Logos (CSS-Only)

```css
@keyframes logo-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.logo-strip { display: flex; overflow: hidden; mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%); }
.logo-track { display: flex; gap: 3rem; flex-shrink: 0; animation: logo-scroll 30s linear infinite; }
.logo-track:hover { animation-play-state: paused; }
.logo-track img { height: 40px; object-fit: contain; filter: grayscale(100%); opacity: 0.5; transition: all 0.3s; }
.logo-track img:hover { filter: grayscale(0%); opacity: 1; }
```

Duplicate logo set in HTML for seamless loop.

---

## 52. Animated Gradient Borders

### 52a. Rotating Conic Gradient

```css
@property --border-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

.gradient-border-card {
  background: linear-gradient(var(--color-background), var(--color-background)) padding-box,
              conic-gradient(from var(--border-angle), var(--color-primary), #8b5cf6, var(--color-primary)) border-box;
  border: 2px solid transparent;
  border-radius: 12px;
  animation: border-rotate 4s linear infinite;
}

@keyframes border-rotate { to { --border-angle: 360deg; } }
```

---

## 53. Aceternity UI / 21st.dev Advanced Patterns

Patterns requiring React + Framer Motion (use `client:load` in Astro):

- **3D Card Effect** -- Mouse-tracked perspective rotation with `rotateX`, `rotateY`, `translateZ`
- **Sticky Scroll Reveal** -- Content sticks while paired content scrolls. `useScroll()` + `useTransform()`
- **Hero Parallax** -- Multiple rows scroll at different velocities
- **Container Scroll Animation** -- Card rotates 20deg to 0deg on scroll with scale 1.05 to 1
- **Infinite Moving Cards** -- CSS keyframe: `translate(calc(-50% - 0.5rem))` with duplicated content
- **Spotlight Background** -- SVG spotlight animates across background
- **Card Spotlight** -- Radial gradient follows cursor, ~350px radius

Pure CSS from Aceternity (no React needed): Moving border, shimmer button, infinite cards, spotlight SVG.

**Source:** [Aceternity UI](https://ui.aceternity.com/components), [21st.dev](https://21st.dev)

---

## 54. Wave Section Dividers

```html
<svg viewBox="0 0 1200 100" preserveAspectRatio="none" class="w-full h-[80px] block">
  <path d="M0,50 Q300,0 600,50 T1200,50 L1200,100 L0,100 Z" fill="currentColor"></path>
</svg>
```

Generators: [Get Waves](https://getwaves.io/) | [Wavier](https://wavier.art/) | [SVG Wave Generator](https://codeshack.io/svg-wave-generator/)

---

## 55. Accessibility Essentials

```css
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

---

## 56. Component Libraries Reference

| Library | URL | Notes |
| ------- | --- | ----- |
| Aceternity UI | ui.aceternity.com | React + Tailwind, advanced animations |
| 21st.dev | 21st.dev | Community, copy-paste |
| HyperUI | hyperui.dev | 226+ Tailwind HTML components |
| daisyUI | daisyui.com | Tailwind plugin, 40+ components |
| Flowbite | flowbite.com | Tailwind + JS, forms/navs/modals |
| Preline UI | preline.co | Enterprise-grade Tailwind |
| shadcn/ui | ui.shadcn.com | React + Tailwind, fully customizable |
| UIverse.io | uiverse.io | 4000+ elements, MIT licensed |
| FreeFrontend | freefrontend.com | Large CSS effect collections |
| CodyHouse | codyhouse.co | Interactive components |

---

## Tools and Generators

Quick-reference list of online generators for these patterns:

| Tool | URL | Purpose |
|------|-----|---------|
| css.glass | https://css.glass/ | Glassmorphism generator |
| ui.glass | https://ui.glass/generator | Glassmorphism with live preview |
| SVG Backgrounds | https://www.svgbackgrounds.com/elements/svg-shape-dividers/ | Section divider SVGs |
| CSS Separator Generator | https://codeshack.io/css-separator-generator/ | Custom section separators |
| CSS Wave Generator | https://uisurgeon.com/tools/css-wave-generator | Animated wave patterns |
| Hype4 Glassmorphism | https://hype4.academy/tools/glassmorphism-generator | Glass effect generator |

---

## Browser Support Notes (2026)

| Feature | Support | Notes |
|---------|---------|-------|
| `backdrop-filter` | ~95% | Include `-webkit-` prefix for Safari |
| `scroll-snap-type` | ~97% | Fully production-ready |
| `clip-path` | ~97% | polygon() and path() both well-supported |
| `@property` | ~85% | Needed for animated gradients |
| `::details-content` | ~70% | Chrome 131+, Firefox/Safari partial |
| `calc-size()` | ~65% | Chrome 129+, experimental elsewhere |
| `::scroll-marker` | ~40% | Chrome 135+, experimental |
| `:has()` | ~93% | Production-ready |
| `container queries` | ~91% | Production-ready |
| `anchor positioning` | ~45% | Chrome 125+, experimental elsewhere |

---

## 57. CSS Native Scroll-Driven Animations

CSS `animation-timeline: view()` and `animation-range` for zero-JS scroll reveals.

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(50px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal-on-scroll {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

Scroll-linked progress bar:

```css
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 4px;
  background: linear-gradient(to right, var(--color-primary), var(--color-accent));
  transform-origin: left;
  animation: grow-bar linear;
  animation-timeline: scroll(root);
}
@keyframes grow-bar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

Note: Polyfill needed for Safari. Falls back gracefully to static state.

---

## 58. Variable Font Weight Breathing Animation

Smoothly animate between font weights using variable fonts.

```css
.breathe {
  font-variation-settings: 'wght' 300;
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { font-variation-settings: 'wght' 300; }
  50%      { font-variation-settings: 'wght' 800; }
}
```

---

## 59. Text Reveal with Clip-Path

Cinematic text reveal using animated clip-path mask.

```css
.text-reveal {
  clip-path: inset(0 100% 0 0);
  animation: reveal 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes reveal {
  to { clip-path: inset(0 0 0 0); }
}
```

---

## 60. Staggered Character Animation

Split text into characters, animate each with staggered delay.

```js
document.querySelectorAll('.split-text').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.04}s`;
    el.appendChild(span);
  });
});
```

```css
.split-text span {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: char-in 0.4s ease forwards;
}
@keyframes char-in {
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 61. Magnetic Button Effect

Button follows cursor when hovering nearby.

```js
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'none';
  });
});
```

---

## 62. Ripple Click Effect

Material-style ripple from click point.

```js
document.querySelectorAll('.ripple-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});
```

```css
.ripple-btn { position: relative; overflow: hidden; }
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  width: 100px; height: 100px;
  margin-left: -50px; margin-top: -50px;
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
```

---

## 63. Animated Gradient with @property (CSS Houdini)

Smoothly animate gradient colors -- impossible with standard CSS.

```css
@property --color-1 {
  syntax: '<color>';
  initial-value: #ff6b6b;
  inherits: false;
}
@property --color-2 {
  syntax: '<color>';
  initial-value: #4ecdc4;
  inherits: false;
}
.animated-gradient {
  background: linear-gradient(135deg, var(--color-1), var(--color-2));
  animation: shift-colors 5s ease infinite alternate;
}
@keyframes shift-colors {
  0%   { --color-1: #ff6b6b; --color-2: #4ecdc4; }
  33%  { --color-1: #a855f7; --color-2: #3b82f6; }
  66%  { --color-1: #f59e0b; --color-2: #ef4444; }
  100% { --color-1: #10b981; --color-2: #6366f1; }
}
```

---

## 64. Grainy/Noise Texture Overlay

Film grain over gradients for premium tactile feel.

```css
.grainy {
  position: relative;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.grainy::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.15;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

---

## 65. Aurora / Blob Background

Soft organic color blobs drifting like aurora borealis.

```css
.aurora { position: relative; overflow: hidden; background: #0a0a2e; }
.aurora .blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: drift 8s ease-in-out infinite alternate;
}
.aurora .blob:nth-child(1) {
  width: 400px; height: 400px;
  background: #4facfe;
  top: -10%; left: -5%;
}
.aurora .blob:nth-child(2) {
  width: 350px; height: 350px;
  background: #f093fb;
  bottom: -10%; right: -5%;
  animation-delay: -3s;
  animation-direction: alternate-reverse;
}
@keyframes drift {
  to { transform: translate(100px, 50px) rotate(30deg); }
}
```

---

## 66. Lightweight Particle Background (Canvas)

Floating particles with connecting lines that react to mouse.

```html
<canvas id="particles" style="position:absolute;inset:0;pointer-events:none;"></canvas>
```

```js
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = Array.from({length: 60}, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5,
  r: Math.random() * 2 + 1
}));
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
  });
  particles.forEach((a, i) => {
    particles.slice(i + 1).forEach(b => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${1 - d / 120})`;
        ctx.stroke();
      }
    });
  });
  requestAnimationFrame(animate);
}
animate();
```

---

## 67. Broken / Asymmetric Grid Layout

Elements overlap and break grid alignment for editorial feel.

```css
.broken-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
}
.broken-grid .image {
  grid-column: 1 / 8;
  grid-row: 1 / 3;
}
.broken-grid .text-block {
  grid-column: 5 / 12;
  grid-row: 2 / 4;
  z-index: 2;
  background: rgba(0,0,0,0.85);
  padding: 2rem;
  margin-top: 3rem;
}
```

---

## 68. Duotone Image Filter (CSS Only)

Two-color tone on images using blend modes.

```css
.duotone { position: relative; overflow: hidden; }
.duotone img {
  filter: grayscale(100%) contrast(1.2);
  mix-blend-mode: multiply;
}
.duotone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #39ff14;
  mix-blend-mode: lighten;
  z-index: 1;
}
.duotone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #1a1a2e;
  mix-blend-mode: darken;
  z-index: 2;
}
```

---

## 69. Image Reveal on Scroll (Clip-Path Wipe)

Image progressively reveals via scroll-driven clip-path.

```css
.image-reveal {
  clip-path: inset(0 100% 0 0);
  animation: wipe-in linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}
@keyframes wipe-in {
  to { clip-path: inset(0 0 0 0); }
}
```

---

## 70. Full-Screen Overlay Navigation

Nav expands from a point via clip-path circle with staggered link reveals.

```css
.nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  clip-path: circle(0% at top right);
  transition: clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}
.nav-overlay.active {
  clip-path: circle(150% at top right);
}
.nav-overlay a {
  display: block;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  font-size: 2rem;
}
.nav-overlay.active a { opacity: 1; transform: translateY(0); }
.nav-overlay.active a:nth-child(1) { transition-delay: 0.2s; }
.nav-overlay.active a:nth-child(2) { transition-delay: 0.3s; }
.nav-overlay.active a:nth-child(3) { transition-delay: 0.4s; }
.nav-overlay.active a:nth-child(4) { transition-delay: 0.5s; }
```

---

## 71. View Transitions API

Native browser page transitions -- app-like feel without libraries.

```js
document.startViewTransition(() => {
  updateDOM();
});
```

```css
::view-transition-old(root) { animation: fade-out 0.3s ease; }
::view-transition-new(root) { animation: fade-in 0.3s ease; }
.hero-image { view-transition-name: hero; }
```

---

## 72. Page Load Curtain Reveal

Colored overlay slides away to reveal content on load.

```css
.page-curtain {
  position: fixed;
  inset: 0;
  background: var(--color-background);
  z-index: 9999;
  animation: curtain-up 0.8s 0.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes curtain-up {
  to { transform: translateY(-100%); }
}
```

---

## 73. Custom Cursor with Mix-Blend-Mode

Circle cursor that inverts colors of whatever it hovers.

```css
.custom-cursor {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transition: transform 0.15s ease;
}
.custom-cursor.hovering {
  transform: scale(2.5);
  background: #fff;
}
```

```js
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX - 20}px`;
  cursor.style.top = `${e.clientY - 20}px`;
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});
```

---

## 74. SVG Line Drawing on Scroll

SVG paths draw themselves as user scrolls.

```css
.svg-draw path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 50%;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

---

## 75. CSS-Only Animated Number Counter

Numbers count up using @property -- zero JavaScript.

```css
@property --num {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}
.counter {
  counter-reset: num var(--num);
  animation: count-up 2s ease-out forwards;
  animation-timeline: view();
  animation-range: entry 50% cover 50%;
}
.counter::after {
  content: counter(num);
}
@keyframes count-up {
  to { --num: 150; }
}
```

---

## 76. Sliding Nav Pill Indicator

Background pill slides between nav items on hover.

```js
const nav = document.querySelector('.nav-pills');
const indicator = nav.querySelector('.indicator');
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const { offsetLeft, offsetWidth, offsetHeight } = link;
    indicator.style.left = `${offsetLeft}px`;
    indicator.style.width = `${offsetWidth}px`;
    indicator.style.height = `${offsetHeight}px`;
  });
});
```

```css
.nav-pills { display: flex; position: relative; gap: 0.5rem; }
.nav-pills .indicator {
  position: absolute;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
}
```

---

## 77. GSAP ScrollTrigger Scrub & Pin

Animation progress tied directly to scroll position. Pin sections in viewport during horizontal scroll.

```js
// Scrub: animation linked to scroll
gsap.to(".element", {
  x: 500,
  rotation: 360,
  scrollTrigger: {
    trigger: ".section",
    start: "top center",
    end: "bottom center",
    scrub: true,     // instant link
    // scrub: 1,     // 1s catch-up delay (smoother)
  }
});

// Pin + horizontal scroll through panels
let sections = gsap.utils.toArray(".panel");
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".container",
    pin: true,
    scrub: 1,
    end: () => "+=" + document.querySelector(".container").offsetWidth
  }
});
```

Note: GSAP is completely free for all uses (including commercial) since Webflow's acquisition.

---

## 78. GSAP SplitText Character Animation

Split text into characters/words/lines and animate each with staggered timing.

```js
let split = new SplitText(".heading", { type: "chars" });
gsap.from(split.chars, {
  y: 100,
  opacity: 0,
  stagger: 0.05,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: { trigger: ".heading", start: "top 80%" }
});
```

SplitText is now free as part of GSAP.

---

## 79. Elastic Grid Scroll (Lag-Based Layout)

Grid columns move at different scroll speeds, creating a soft elastic parallax feel.

```js
ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,
  effects: true
});
```

```html
<div data-speed="0.8">Slow column</div>
<div data-speed="1.2">Fast column</div>
```

Source: [Codrops Elastic Grid](https://tympanus.net/codrops/2025/06/03/elastic-grid-scroll-creating-lag-based-layout-animations-with-gsap-scrollsmoother/)

---

## 80. 3D Scroll-Driven Text (Cylinder/Circle/Tube)

Text transforms in 3D space as user scrolls using GSAP ScrollTrigger with CSS 3D transforms.

```css
.text-char {
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--scroll) * 360deg)) translateZ(80px);
}
```

```js
gsap.to(".text-char", {
  rotateX: 360,
  scrollTrigger: { trigger: ".section", scrub: 1 }
});
```

Source: [Codrops 3D Text](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/)

---

## 81. Layered Zoom Scroll Effect

Cinematic depth scrolling where layers zoom in at different rates.

```js
gsap.to(".layer", {
  scale: 1.5,
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    pin: true
  }
});
```

Source: [Codrops Layered Zoom](https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/)

---

## 82. Glassmorphism Cards with Animated Rotating Border

Frosted glass cards with conic-gradient borders rotating via @property.

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  position: relative;
}

.glass-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: conic-gradient(from var(--angle), #ff0080, #7928ca, #ff0080);
  z-index: -1;
  animation: rotate-border 3s linear infinite;
}

@keyframes rotate-border {
  to { --angle: 360deg; }
}
```

---

## 83. 3D Flip Card

Card rotates 180 degrees on Y-axis on hover, revealing back content.

```css
.card { perspective: 1000px; }
.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.card:hover .card-inner { transform: rotateY(180deg); }
.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}
.card-back { transform: rotateY(180deg); }
```

---

## 84. CSS Blob Morphing Animation

Organic flowing blob shapes that morph continuously via border-radius keyframes.

```css
.blob {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  animation: morph 8s ease-in-out infinite;
}

@keyframes morph {
  0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50%  { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
  75%  { border-radius: 60% 30% 60% 40% / 70% 40% 50% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
}
```

---

## 85. Vanta.js Plug-and-Play 3D Backgrounds

Drop-in animated WebGL backgrounds with 13+ presets (WAVES, BIRDS, FOG, NET, GLOBE, HALO, etc.).

```html
<script src="three.min.js"></script>
<script src="vanta.waves.min.js"></script>
<script>
VANTA.WAVES({
  el: "#hero",
  color: 0xD4A843,
  waveHeight: 20,
  waveSpeed: 0.7,
  zoom: 0.8,
  mouseControls: true
});
</script>
```

~120kb total. 60fps on desktop. Avoid multiple instances on one page. Test on mobile.

---

## 86. GSAP Custom Cursor with Elastic Trailing

Custom dot cursor with elastic follower that expands on hoverable elements.

```js
const cursor = document.querySelector(".cursor");
const follower = document.querySelector(".cursor-follower");

document.addEventListener("mousemove", (e) => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
  gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
});

document.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("mouseenter", () => gsap.to(follower, { scale: 2.5, opacity: 0.5 }));
  el.addEventListener("mouseleave", () => gsap.to(follower, { scale: 1, opacity: 1 }));
});
```

```css
.cursor, .cursor-follower {
  position: fixed; pointer-events: none; border-radius: 50%; z-index: 9999;
}
.cursor { width: 8px; height: 8px; background: var(--color-primary); }
.cursor-follower {
  width: 32px; height: 32px;
  border: 1px solid var(--color-primary);
  transform: translate(-50%, -50%);
}
```

Desktop only -- hide on touch devices with `@media (hover: none)`.

---

## 87. CSS Mask Reveal Effects (Wipe, Clock, Iris)

Images/sections reveal through gradient masks in patterns.

```css
/* Iris reveal */
.iris-reveal {
  mask-image: radial-gradient(circle, black 0%, transparent 0%);
  animation: iris-open 1.2s ease forwards;
}
@keyframes iris-open {
  to { mask-image: radial-gradient(circle, black 100%, transparent 100%); }
}

/* Diagonal wipe */
.diagonal-wipe {
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  animation: wipe-in 0.8s ease forwards;
}
@keyframes wipe-in {
  to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
}
```

---

## 88. GSAP MorphSVG

Morph between any two SVG shapes, auto-handling different point counts.

```js
gsap.to("#shape1", {
  morphSVG: "#shape2",
  duration: 1.5,
  ease: "power2.inOut"
});
```

---

## 89. CSS :has() Parent Selector Patterns

Style parent elements based on their children -- previously impossible without JS.

```css
/* Card adapts if it has an image */
.card:has(img) { grid-template-rows: 200px 1fr; }
.card:not(:has(img)) { grid-template-rows: 1fr; }

/* Form group highlights on focus */
.form-group:has(input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.2);
}

/* Layout changes if sidebar exists */
.page:has(.sidebar) { grid-template-columns: 1fr 300px; }
```

---

## 90. CSS Container Queries

Style components based on container size instead of viewport -- truly modular responsive components.

```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
@container (max-width: 399px) {
  .card { flex-direction: column; }
}
```

---

## 91. CSS color-mix() Dynamic Palettes

Generate tints/shades/muted variants from a single brand color.

```css
:root { --brand: #D4A843; }
.lighter { background: color-mix(in oklch, var(--brand) 40%, white); }
.darker  { background: color-mix(in oklch, var(--brand) 70%, black); }
.muted   { background: color-mix(in oklch, var(--brand) 30%, gray); }
```

---

## 92. Paint API (CSS Houdini Worklets)

Draw procedural patterns into element backgrounds via JavaScript worklets.

```js
// wave-worklet.js
class WavePainter {
  static get inputProperties() { return ['--wave-amplitude', '--wave-color']; }
  paint(ctx, size, props) {
    const amp = parseInt(props.get('--wave-amplitude'));
    ctx.fillStyle = props.get('--wave-color').toString();
    ctx.beginPath();
    ctx.moveTo(0, size.height);
    for (let x = 0; x < size.width; x++) {
      ctx.lineTo(x, size.height / 2 + Math.sin(x * 0.02) * amp);
    }
    ctx.lineTo(size.width, size.height);
    ctx.fill();
  }
}
registerPaint('wave', WavePainter);
```

```css
.section {
  --wave-amplitude: 30;
  --wave-color: var(--color-primary);
  background: paint(wave);
}
```

Chromium-only. Runs in separate thread.

---

## 93. Pure CSS Parallax (Perspective + translateZ)

Multi-layer depth scrolling with zero JavaScript.

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 1px;
}
.parallax-layer--back {
  transform: translateZ(-2px) scale(3);
}
.parallax-layer--front {
  transform: translateZ(0);
}
```

---

## 94. Staggered Reveal with Inline CSS Variables

Elements reveal sequentially using `--i` variable-driven delays. No JS class toggling needed.

```css
.stagger-item {
  opacity: 0;
  transform: translateY(30px);
  animation: fade-up 0.6s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.08s);
}
@keyframes fade-up {
  to { opacity: 1; transform: translateY(0); }
}
```

```html
<div class="stagger-item" style="--i:0">Item 1</div>
<div class="stagger-item" style="--i:1">Item 2</div>
<div class="stagger-item" style="--i:2">Item 3</div>
```

---

## 95. Web Audio API Micro-Interactions

Subtle audio feedback on user actions using Web Audio API oscillator.

```js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq = 440, duration = 0.1, type = "sine") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.stop(audioCtx.currentTime + duration);
}

button.addEventListener("click", () => playTone(880, 0.08));
```

Use sparingly. Always provide mute toggle.

---

## 96. CSS Neon Glow Text (Pulsing)

Layered text-shadows with pulsing animation for neon signage effect.

```css
.neon {
  color: var(--color-primary);
  text-shadow:
    0 0 7px var(--color-primary),
    0 0 10px var(--color-primary),
    0 0 21px var(--color-primary),
    0 0 42px var(--color-accent),
    0 0 82px var(--color-accent);
  animation: neon-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes neon-pulse {
  from { text-shadow: 0 0 7px var(--color-primary), 0 0 10px var(--color-primary), 0 0 21px var(--color-primary); }
  to   { text-shadow: 0 0 7px var(--color-primary), 0 0 10px var(--color-primary), 0 0 21px var(--color-primary), 0 0 42px var(--color-accent), 0 0 82px var(--color-accent); }
}
```
