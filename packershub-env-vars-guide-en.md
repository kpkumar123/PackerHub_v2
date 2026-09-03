# PackersHub — Environment Variables Complete Guide

This file explains every variable in `.env.example` — what it's for, where to get the value, how to set it, and what happens if you leave it unset.

**Important:** None of these are compulsory. Every integration in this codebase is written to no-op gracefully if its variable is missing — the feature just stays off, nothing breaks. Only fill in the ones for features you actually want active; leave the rest blank.

---

## How to set these — two different places

| Where | How | When to use |
|---|---|---|
| Local `.env` file | Copy `.env.example` to `.env` and fill in values | For testing on your own computer (`wrangler pages dev` reads it automatically) |
| Cloudflare Pages Secret | `wrangler pages secret put VARIABLE_NAME --project-name=packershub` | For the live production site — **this is the real method**, never commit a `.env` file with real values to git |

You can also set these from the Cloudflare Dashboard: **Pages → your project → Settings → Environment variables → Add variable**.

---

## 1. Lead Notifications & Follow-up Sequence
*(File: `src/pages/api/follow-up.ts`)*

When someone submits an enquiry on the website, these send an alert to your team via email, SMS, WhatsApp, and later send follow-up messages to the customer.

| Variable | What it's for | Where to get it |
|---|---|---|
| `RESEND_API_KEY` | Instant email alert to you when a lead comes in | [resend.com](https://resend.com) — free for up to 100 emails/day |
| `LEAD_NOTIFY_EMAIL` | The email address that alert goes to | Your own email address (e.g. your Gmail/business mail) |
| `MSG91_AUTH_KEY` | SMS alert to your team | [msg91.com](https://msg91.com) — India SMS gateway; create an account and get the API key |
| `MSG91_SENDER_ID` | The 6-character name shown as "From" on the SMS | Register a TRAI-approved sender ID in the MSG91 dashboard (e.g. `PKRHUB`) |
| `MSG91_TEMPLATE_ID` | Under DLT rules, every SMS needs a registered template | The ID you get after registering your SMS text under MSG91 dashboard → DLT Templates |
| `WABA_TOKEN` | For sending automated messages via WhatsApp | Access token from Meta (Facebook) Business Manager after setting up the WhatsApp Business API |
| `WABA_PHONE_NUMBER_ID` | The Meta ID for your WhatsApp Business number | Found under Meta Business Manager → WhatsApp → Phone Numbers |
| `WABA_TEMPLATE_FOLLOWUP` | The Meta-approved template name used for the follow-up message | The name of a template you created and got approved in WhatsApp Business Manager |
| `TEAM_PHONE` | The number the SMS alert is sent to | Your sales team's number (e.g. +91 77310 74075) |

**If left unset:** setting `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` alone gets email alerts working right away. Add `MSG91_AUTH_KEY` and SMS alerts work too. Leave everything blank and the lead form still saves the lead — it just won't send any notification.

---

## 2. Google Review Request Step
*(File: `src/pages/api/follow-up.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `GOOGLE_REVIEW_URL` | Sends a "please leave a review" link to the customer after their move is done | Google Business Profile → "Get more reviews" button → copy the short link (looks like `https://g.page/r/XXXXXXXXXXXX/review`) |

---

## 3. Cron Endpoint Protection
*(File: `src/pages/api/follow-up-cron.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `CRON_SECRET` | Protects the `/api/follow-up-cron` endpoint that triggers the follow-up sequence on a schedule | Generate any long random string yourself (e.g. with a password generator) |

**Important:** this is required if you're pointing an external cron service (cron-job.org, Render cron, etc.) at this endpoint — without it, anyone who finds the URL could trigger it too.

---

## 4. AI Phone Agent / Chat
*(File: `src/pages/api/chat.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Powers the website chatbot and the Twilio voice agent, both running on Claude | [console.anthropic.com](https://console.anthropic.com) → API Keys → create a new key (billing needs to be set up) |

---

## 5. Google Analytics 4
*(File: `src/components/Analytics.astro`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `PUBLIC_GA_MEASUREMENT_ID` | Tracks site traffic via GA4 | GA4 → Admin → Data Streams → your web stream → Measurement ID (format: `G-XXXXXXXXXX`) |

**Note:** the name starts with `PUBLIC_` because it needs to be read client-side (in the browser). If unset, it simply renders nothing — no error.

---

## 6. Search Console Indexing Notifications
*(File: `src/pages/api/index-notify.ts`)*

Notifies Google immediately when a new page or blog post is published, for faster indexing — directly relevant to the indexing struggle you've been dealing with.

| Variable | What it's for | Where to get it |
|---|---|---|
| `GOOGLE_SA_EMAIL` | The service account email used to call the Google Indexing API | Google Cloud Console → IAM & Admin → Service Accounts → create one, enable the Indexing API on that project, then add that service account email as an Owner on your Search Console property |
| `GOOGLE_SA_KEY` | That service account's private key (JSON) | On the same service account page → Keys → Add Key → download the JSON, and take the private key value from it |

---

## 7. Auto-Index Protection (Optional, Recommended)

| Variable | What it's for | Where to get it |
|---|---|---|
| `AUTO_INDEX_TOKEN` | Locks down `/api/index-notify` so only your GitHub Actions workflow (and you, via `/admin/index-ping/`) can trigger Google indexing calls | Create a random string yourself and set the **same value in two places**:<br>1️⃣ Cloudflare Pages → Settings → Environment variables → `AUTO_INDEX_TOKEN`<br>2️⃣ GitHub repo → Settings → Secrets and variables → Actions → New repository secret → name it `AUTO_INDEX_TOKEN` |

**If left unset:** the endpoint keeps working, just unprotected.

---

## 8. Site URL

| Variable | What it's for | Where to get it |
|---|---|---|
| `SITE_URL` | Used to build absolute links in emails and schema | Already fixed to `https://www.packershub.in` — no need to change |

---

## 9. Admin Panel Authentication
*(Files: `/admin/orders/`, `/admin/seo-ops/`, `/admin/integrations/`, `src/pages/api/admin/*.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `ADMIN_TOKEN` | Acts like a password for your admin pages (orders, SEO ops, integration status) — sent as the `x-admin-token` header | Generate a long random string yourself |

**Important:** if this is unset, the admin API routes **fail closed** (i.e. they block requests, they don't open up) — so there's no security risk, but you also won't be able to use the admin pages yourself. It's required to actually use them.

---

## 10. Driver GPS Tracking
*(Files: `src/pages/api/gps/update.ts`, `src/pages/driver/[id].astro`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `GPS_ADMIN_TOKEN` | A separate secret used for updating driver GPS location — kept apart from `ADMIN_TOKEN` so the link sent to a driver never carries the master admin token | Generate a random string yourself. A signed per-driver token is then auto-generated from this at `/admin/orders/` for each driver |

---

## 11. Razorpay Payment Checkout
*(Files: `src/pages/api/payment/create-order.ts`, `verify.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `RAZORPAY_KEY_ID` | Used to collect advance payment / payment online from customers | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | The secret key that pairs with the above | Generated alongside the Key ID on the same page (shown only once — save it carefully) |

---

## 12. Twilio Voice Signature Verification
*(Files: `src/pages/api/voice/*.ts`)*

| Variable | What it's for | Where to get it |
|---|---|---|
| `TWILIO_AUTH_TOKEN` | Verifies that incoming voice call webhook requests genuinely came from Twilio | Twilio Console → Account → Auth Token |

**Important:** without this, anyone who finds your voice webhook URL could POST fake call data. The CHANGELOG also recommends setting this before going live.

---

## Quick summary — what you need for what

| If you want... | Set these variables |
|---|---|
| Email alert when a lead comes in | `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL` |
| SMS alert when a lead comes in | `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID`, `TEAM_PHONE` |
| Automated WhatsApp messages | `WABA_TOKEN`, `WABA_PHONE_NUMBER_ID`, `WABA_TEMPLATE_FOLLOWUP` |
| Google review request | `GOOGLE_REVIEW_URL` |
| AI chatbot / voice agent | `ANTHROPIC_API_KEY` |
| Traffic tracking (GA4) | `PUBLIC_GA_MEASUREMENT_ID` |
| Faster Google indexing | `GOOGLE_SA_EMAIL`, `GOOGLE_SA_KEY`, `AUTO_INDEX_TOKEN` |
| To use the admin pages | `ADMIN_TOKEN` |
| Driver GPS tracking | `GPS_ADMIN_TOKEN` |
| Online payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Voice agent security | `TWILIO_AUTH_TOKEN` |
| Cron-driven follow-up automation | `CRON_SECRET` |

---

*This guide is based on the `.env.example` file from the PackersHub v10.7.36 codebase.*
