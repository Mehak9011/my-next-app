# Pricing ACF setup — WordPress side (data only, no design)

This page's **copy + prices** come from WordPress ACF, everything else
(design, calculator logic, styling) lives in Next.js.

**Two content routes are supported — pick whichever you prefer:**

- **Option A (current live setup): `pricing` CPT posts** — each post of the
  `Pricing` post type drives one calculator tab (see section 0 below).
- **Option B (full control): ACF group on the Pricing page** — the
  `pricingFields` group described in sections 1+ overrides everything
  (hero, tab copy, summary texts, CTA).

Both layers merge over the bundled Next.js defaults, slot by slot:
page-ACF first, then CPT posts on top. Anything missing simply keeps
its default — the page never breaks.

---

## 0. Option A — `pricing` CPT posts (each post = one tab)

The `pricing` post type maps to the calculator like this:

| Post | Drives | Fields it reads (ACF, name matched flexibly) |
|---|---|---|
| `Designing` | Design tab (Yes/No questions) | see 0.1 |
| `Development` | Development tab (SEO plans) | see 0.2 |

The **post title becomes the tab label** (e.g. post "Designing" → tab
"Designing"). Field values are matched by *normalised name*
(lowercase, non-alphanumerics stripped), so ACF auto-generated names
like `logo_design` (label "Logo Design") or `website_re-design`
(label "Website Re-design") all resolve — exact spelling not required.

### 0.1 Designing post — field → calculator slot

| ACF field (label → generated name) | Calculator slot |
|---|---|
| `Logo Design` → `logo_design` | Logo question Yes price |
| `Branding` → `branding` | Branding question Yes price |
| `Website Re-design` → `website_re-design` | Website Redesign Yes price |
| `Custom Development` → `custom_development` | Custom Development — price > 0 makes it a priced Yes/No; 0/empty keeps "Contact Us" |
| `Static Website` / `E-Commerce Website` | Website-type option prices (optional) |
| `Products 100` / `Products 550` | E-commerce product-slot prices (optional) |
| `<key>_title` / `<key>_description` per question | Optional copy overrides (e.g. `logo_title`) |
| `kicker`, `heading`, `subtext`, `summary_label`, `summary_title`, `empty_text`, `total_label`, `total_note`, `cta_label` | Optional tab/summary copy |

Current live values: Logo Design 20, Branding 90, Website Re-design 50,
Custom Development 60.

### 0.2 Development post — plan slots

Three plan slots, prefix per slot: `starter` / `growth` / `premium`
(`seo_starter…`, `plan_1…` also accepted). Per slot:

- `<prefix>_title` (or `_name`) — plan name
- `<prefix>_price` — number
- `<prefix>_features` — textarea, one feature per line
- `<prefix>_description`, `<prefix>_per`, `<prefix>_cta` — optional

Fields missing for a slot keep that plan's default. Optional tab copy:
`kicker`, `heading`, `subtext`.

### 0.3 One WordPress setting needed (REST exposure)

Right now REST returns `acf: []` for these posts, so only the tab
labels come through. To expose the ACF values over REST:

- Edit the **Pricing** ACF field group → Settings → **Show in REST** = Yes
  (ACF 6.1+). No other plugin needed.

WPGraphQL route (`/graphql`) currently returns 404 because the headless
`.htaccess` rewrite sends it to the Next app. To enable the GraphQL
route as well, exclude it the same way as `wp-json`:

```apache
RewriteCond %{REQUEST_URI} !^/graphql
```

Once either route is live, the prices above appear in the calculator
automatically (60s ISR cache).

---

## 1. Group and location (Option B — page-level ACF)

- Group title/title: `Pricing Fields`
- Field name: `pricingFields`
- Location rule: Page is equal to `Pricing`
- Show in GraphQL: enabled (WPGraphQL for ACF)

Top-level field names (keep exactly):

- `hero_kicker`, `hero_title`, `hero_title_accent`, `hero_subtitle`
- `designing` (group: Designing tab)
- `development` (group: Development tab)
- `cta_title`, `cta_subtitle`, `cta_button`

Every `graphql_field_name` is the camelCase version shown on the right.

## 2. Group A — `designing` ("Designing" tab)

Top-level fields:

- `design_tab_label` → `designTabLabel`
- `design_kicker` → `designKicker`
- `design_heading` → `designHeading`
- `design_subtitle` → `designSubtitle`
- `design_questions` → `designQuestions` (group with q1…q5)
- `summary_label` → `summaryLabel`
- `summary_title` → `summaryTitle`
- `summary_empty` → `summaryEmpty`
- `total_label` → `totalLabel`
- `total_note` → `totalNote`
- `design_cta` → `designCta`

### Questions group: `design_questions` → `designQuestions`

Five fixed sub-groups. Order never changes; fill copy/prices only.

- `q1_logo` → `q1Logo`
- `q2_branding` → `q2Branding`
- `q3_website` → `q3Website`
- `q4_redesign` → `q4Redesign`
- `q5_custom` → `q5Custom`

Each question group uses these fields:

- `number` (text)
- `title` (text)
- `description` (text)
- `yes_price` → `yesPrice` (number)
- `yes_sub` → `yesSub` (text)
- `mode` (text: `simple`, `website`, or `contact`)

Q1, Q2, Q4, Q5 are `simple`/`contact`; other website slots may stay empty.

### Website slots (only Q3 uses these)

- `website_prompt` → `websitePrompt` (text)
- `website_types` → `websiteTypes` (group)
  - `static` (group)
  - `ecommerce` (group)
  - each has `title`, `description`, `price`, `price_label` → `priceLabel`
- `static_note` → `staticNote` (text)
- `static_title` → `staticTitle` (text)
- `static_description` → `staticDescription` (text)
- `static_label` → `staticLabel` (text)
- `product_prompt` → `productPrompt` (text)
- `product_options` → `productOptions` (group)
  - `option_100` → `option100` (group)
  - `option_550` → `option550` (group)
  - each has `title`, `description`, `price`, `price_label` → `priceLabel`

## 3. Group B — `development` ("Development" tab)

Top-level fields:

- `dev_tab_label` → `devTabLabel`
- `dev_popular_label` → `devPopularLabel`
- `dev_kicker` → `devKicker`
- `dev_heading` → `devHeading`
- `dev_subtitle` → `devSubtitle`
- `dev_plans` → `devPlans` (group with plan1…plan3)

### Plans group: `dev_plans` → `devPlans`

Three fixed sub-groups:

- `plan_1` → `plan1`
- `plan_2` → `plan2`
- `plan_3` → `plan3`

Each plan group uses:

- `name` (text)
- `description` (textarea)
- `price` (number)
- `per` (text)
- `features` (textarea; one feature per line)
- `cta` (text)

Plan 2 is always styled as the popular/highlighted card.

## 4. WordPress checklist

1. Create/keep the blank published `Pricing` page (slug `pricing`).
2. Import `wordpress/acf-field-group.json` through ACF → Tools → Import.
3. Open the Pricing page and fill values; publish/update.
4. Check WPGraphQL shows `pricingFields` on `pageBy(uri:"/pricing/")`.
5. No page-builder content; CMS supplies values only.

## 5. Next.js behaviour

- Read order: WPGraphQL → REST fallback → bundled defaults.
- Every slot falls back independently, so empty fields cannot break `/pricing`.
- Edit copy/prices in WP only; edit layout/calculator in Next.js only.
