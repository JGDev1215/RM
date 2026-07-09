# 02 — UI Design System

## Design Reference
Refer to `RiskGuard Trader (standalone).html`.

The design file contains a full mobile mockup with 7 screens:

1. Dashboard
2. Risk Calculator
3. Trade Logger
4. Dynamic Risk Engine
5. Payout Tracker
6. Restart Tracker
7. Settings

The implementation must follow this visual direction closely.

---

## Design Style

```txt
Mobile-first
Minimalist
Premium trading dashboard
Light mode first
Card-based UI
Large readable numbers
Clear status badges
Soft shadows
Rounded corners
No clutter
No charts unless specifically requested later
```

---

## Colour Tokens

Use CSS variables or theme tokens.

```css
:root {
  --bg-page: #ECECE8;
  --bg-app: #FAFAF8;
  --bg-card: #FFFFFF;
  --bg-muted: #F0F0EC;
  --border-soft: #EFEFEA;
  --text-primary: #1F1F1F;
  --text-secondary: #8A8A8A;
  --text-muted: #B5B5B0;

  --green-bg: #E8F5EE;
  --green-border: #CBE9D9;
  --green-main: #1E9E5A;
  --green-text: #166B45;

  --amber-bg: #FDF3E3;
  --amber-border: #F3E2BF;
  --amber-main: #D98A06;
  --amber-text: #9A6304;

  --red-bg: #FDECEC;
  --red-border: #F3C9C9;
  --red-main: #D63030;
  --red-text: #A32222;

  --blue-bg: #EAF1FD;
  --blue-border: #C9DAF7;
  --blue-main: #2563EB;
  --blue-text: #1D4ED8;
}
```

---

## Typography

Use system font stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
```

Recommended type scale:

```txt
Screen title: 22px / 700
Status title: 24px–26px / 800
Large money value: 30px–34px / 700
Card title label: 12px / 600 / uppercase / letter spaced
Body text: 13px–15px
Bottom nav label: 10px / 600
```

Use tabular numbers for money and contract outputs:

```css
font-variant-numeric: tabular-nums;
```

---

## Layout

### App Frame

```css
width: 390px;
min-height: 844px;
background: var(--bg-app);
border-radius: 44px;
overflow: hidden;
```

For actual app implementation, do not hard-lock the entire app to 390px. Instead:

```css
max-width: 430px;
min-height: 100vh;
margin: 0 auto;
```

### Screen Padding

```css
padding: 12px 20px 16px;
gap: 12px;
```

### Card Style

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 1px 2px rgba(31, 31, 31, 0.04);
}
```

### Status Card Style

```css
.status-card {
  border-radius: 22px;
  padding: 24px 22px;
}
```

---

## Status Colours

```txt
Green = Trade allowed
Amber = Reduce size
Red = Stop trading / danger
Blue = Payout protection
Grey = Restart required / inactive
```

---

## Bottom Navigation

Bottom nav items:

```txt
Dashboard
Calculator
Trades
Payouts
Settings
```

Dynamic Risk Engine and Restart Tracker may be accessed from Dashboard cards or internal routing. They do not need a permanent bottom nav tab unless the developer chooses to include them under Dashboard.

Rules:

- Active nav item uses primary text colour.
- Inactive items use muted grey.
- Keep icons simple or use text-only if icon set is unavailable.

---

## UI Behaviour

- Status must be visible above fold on Dashboard.
- Risk numbers must be large and readable.
- User must never need to search for the trade decision.
- Avoid dense tables.
- Use cards and short labels.
- Use progress bars for daily risk, drawdown, monthly target, and payout progress.
- Forms must use numeric keyboard for prices, risk, P&L, and contract counts.
- Invalid fields must show a clear error message.
