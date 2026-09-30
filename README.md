# Find.ly API docs (Mintlify)

Public documentation for the Find.ly API (`/api/v1`), meant to be published at `https://docs.findly.icu`.

This folder is a standalone [Mintlify](https://mintlify.com) project. It is not part of the Next.js site and is never built by it.

```text
docs/
├── docs.json                  site config: theme (almond), colors, logo, tabs and navigation
├── openapi.json               OpenAPI 3.1 spec, generates the endpoint pages of the "API Reference" tab
├── style.css                  Find.ly look (borders, radius, fonts), loaded by Mintlify on every page
├── same-tab.js                links to findly.icu open in the same tab, without the "external" arrow
├── favicon.png                the Find.ly mark (site/src/app/icon.png)
├── logo/                      light.png (dark text, light mode), dark.png (white text, dark mode)
├── images/api-map.svg         illustration of the home page
├── index.mdx                  Documentation tab: Home
├── quickstart.mdx
├── authentication.mdx
├── guides/
│   ├── modules.mdx
│   ├── raw-files.mdx
│   ├── stealer-export.mdx
│   ├── pagination.mdx
│   ├── billing-and-quotas.mdx
│   ├── rate-limits.mdx
│   └── errors.mdx
├── api-reference/
│   └── overview.mdx           API Reference tab: Overview (endpoints come from openapi.json)
└── code-examples/             Code Examples tab: plain HTTP calls, no SDK
    ├── overview.mdx
    ├── curl.mdx
    ├── python.mdx
    ├── javascript.mdx
    ├── go.mdx
    └── php.mdx
```

## Publish it

### 1. Put the folder in a GitHub repository

Mintlify deploys from Git. Either:

- push the whole Find.ly project (with this `docs/` folder) to a **private** GitHub repository. Make sure `.env*` files and `site/data/` are ignored before the first push; or
- create a small repository that only contains the content of this folder (then skip the monorepo setting in step 3).

### 2. Create a Mintlify account

1. Sign up at <https://mintlify.com> and create a project. The free plan is enough for a public docs site; before step 4, check on <https://mintlify.com/pricing> that your plan includes a custom domain.
2. In the onboarding, skip the starter template: you already have content.

### 3. Connect the repository

1. Dashboard → **Settings → Deployment → Git settings** (`https://app.mintlify.com/settings/deployment/git-settings`).
2. Install the **Mintlify GitHub App**. When GitHub asks which repositories, choose **Only select repositories** and pick the docs repository only.
3. Select the repository and the branch to deploy (for example `main`).
4. If `docs.json` is not at the repository root (whole project pushed): enable **docs.json is in a subdirectory** and set the path to `/docs` (no trailing slash). Save.

Every push to that branch now redeploys the docs. The site is first available on a `*.mintlify.app` address shown in the dashboard.

### 4. Custom domain `docs.findly.icu`

1. Dashboard → **Settings → Deployment → Custom domain** (`https://app.mintlify.com/settings/deployment/custom-domain`), enter `docs.findly.icu`.
2. The dashboard shows the DNS records to create. At the time of writing they are:
   - `TXT` `_acme-challenge.docs` → value from the dashboard
   - `TXT` `_cf-custom-hostname.docs` → value from the dashboard
   - `CNAME` `docs` → `cname.mintlify.builders`

   **Always copy the exact values from the dashboard**, they can change.
3. In Cloudflare (DNS → Records):
   - add the two `TXT` records first and wait until the Mintlify dashboard shows them as verified;
   - then add the `CNAME` with the proxy status **DNS only (grey cloud)**. Mintlify serves its own TLS certificate; a proxied (orange) record is only needed if you want Cloudflare in front, and then Mintlify asks for SSL/TLS mode **Full (strict)** and **Always Use HTTPS** turned off for that hostname. Grey cloud is the simple, recommended setup.
4. DNS usually propagates within 1 to 24 hours (up to 48). The TLS certificate follows within a few hours.

The domain transfer to Cloudflare must be finished before this step, since the records live in the `findly.icu` zone.

### 5. Link it from the site

Once `https://docs.findly.icu` answers, set `NEXT_PUBLIC_DOCS_URL=https://docs.findly.icu` in the site's production environment file, then rebuild the site: the variable is read at build time. The dashboard API page then shows a "Full documentation" button. Nothing changes in this folder.

## Preview locally (optional)

Only if you want to see the site before pushing. Requires Node.js 20.17 or newer.

```bash
npm i -g mint        # the Mintlify CLI (the old "mintlify" package is deprecated)
cd docs
mint dev             # http://localhost:3000
mint dev --port 3333 # if the Find.ly site already uses port 3000
mint validate        # checks docs.json, pages and openapi.json, fails on any warning
mint broken-links    # checks internal links
```

Do not run `mint dev` on port 3000 while `next dev` is running for the site.

## Keep it in sync with the code

The docs describe what the code does. When one of these changes, update the docs in the same change:

| Code (`site/src/...`) | Docs to update |
| --- | --- |
| `lib/public-api/auth.ts` (headers, IP limit, error codes) | `authentication.mdx`, `api-reference/overview.mdx`, `guides/rate-limits.mdx`, `guides/errors.mdx`, `openapi.json` |
| `lib/public-api/http.ts` (envelope, `billed`, `X-Quota-*`, body size) | `api-reference/overview.mdx`, `guides/billing-and-quotas.mdx`, `guides/errors.mdx`, `openapi.json`, `code-examples/*` (helpers) |
| `lib/public-api/search.ts` (fields, formats, response shapes) | `guides/modules.mdx`, `guides/raw-files.mdx`, `api-reference/overview.mdx`, `openapi.json`, `code-examples/*` |
| `lib/intelx/validate.ts`, `lib/intelx/catalog.ts` (input rules, buckets) | `guides/modules.mdx`, `openapi.json` |
| `lib/search.ts` (billing, refunds, per-account limits) | `guides/billing-and-quotas.mdx`, `guides/rate-limits.mdx`, `api-reference/overview.mdx` |
| `lib/plan-rules.ts`, `lib/site.ts`, `lib/plan-access.ts` (quotas, modules, `apiAccess`, Starter's Breach-Search-only API access) | `index.mdx`, `quickstart.mdx`, `authentication.mdx`, `api-reference/overview.mdx`, `guides/billing-and-quotas.mdx`, `guides/modules.mdx`, `guides/errors.mdx`, `openapi.json` |
| `lib/breachdb/*` (Breach Search input, advanced fields, limits) | `guides/modules.mdx` (FindLy Module), `guides/rate-limits.mdx`, `guides/pagination.mdx`, `openapi.json`, `code-examples/*` (Breach Search) |
| `app/api/v1/usage/route.ts` (`usage`, `breach_usage`) | `index.mdx`, `authentication.mdx`, `quickstart.mdx`, `guides/billing-and-quotas.mdx`, `openapi.json`, `code-examples/*` |
| `app/api/v1/stealer-export/route.ts` (archive, headers) | `guides/stealer-export.mdx`, `openapi.json`, `code-examples/*` (Stealer Export) |
| `public/brand/logo-transparent.png`, `app/icon.png` (branding) | `logo/`, `favicon.png` |

Notes:

- Navigation has three tabs: **Documentation** (Getting Started, Search Guides, Integration Guides), **API Reference** (Overview, then the endpoints generated from `openapi.json`) and **Code Examples**.
- The API reference has one page per module (`/api/v1/search/intelligence-search`, …) rather than a single `{module}` page, because each module takes a different body and returns a different shape. They are grouped as **Account** (`GET /api/v1/usage`), **IntelX Modules** (the five IntelX searches, plus Stealer Export) and **FindLy Module** (Breach Search). All six search pages are the same route in the code.
- The code examples call the real endpoints with each language's usual HTTP library. There is no Find.ly SDK: do not add `pip install` / `npm install` of a Find.ly package unless one is actually published.
- The interactive playground is off (`"api.playground.display": "simple"`): it would send real keys through Mintlify's proxy and use real requests. Set it to `"interactive"` in `docs.json` if you want it.
- Theme: `almond` (logo top left, search in the sidebar, tabs at the top, "On this page" on the right). Dark mode is the default; the light/dark toggle is kept, so the logo exists in both versions.
- `same-tab.js` only touches links whose host is `findly.icu` or `www.findly.icu`. Every other external link keeps Mintlify's default (new tab).
