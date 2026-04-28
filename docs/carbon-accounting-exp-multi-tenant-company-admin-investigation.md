# Carbon-Accounting EXP — Investigation: users assigned to multiple tenants/entities cannot see all entities in the top "Company Admin" area

## Problem statement

In the Carbon-Accounting EXP application, when a customer/user account has been granted access to **more than one tenant (entity / company)**, the **top-bar Company Admin selector** (sometimes called the company / tenant switcher) is only showing a subset of the entities the user is supposed to have access to. Some users see only one tenant; others see only the tenant they were last logged into; very few see the full list.

The codebase for Carbon-Accounting EXP is not present in this prototypes repo, so this document captures the **most likely root causes**, the **specific code paths to inspect**, and a **prioritized remediation checklist** that the engineering team can walk through. Cursor IDE/agents can use this as the starting brief when running against the actual `Carbon-Accounting-EXP` repository.

## Symptom recap (as reported)

- User is assigned (in identity / customer admin) to 2+ tenants / entities.
- Top bar Company Admin selector shows fewer entities than the user is provisioned for (commonly only the active one, or only the first/last issued).
- Direct deep-link to a "missing" entity sometimes works (i.e., the data is reachable, the **picker** is the broken surface).
- Behavior is consistent across browser refresh and across browsers (rules out client-only caching).

If the deep-link case does not work, the problem is also at the API/identity layer, not just the UI selector. Both possibilities are covered below.

## Hypothesized root causes (ranked)

### H1. Token / session only carries a single tenant claim

The most common cause for "missing entities in switcher" in multi-tenant SaaS apps that use OIDC / OAuth2 is that the **access token issued at sign-in is scoped to one tenant** and the UI reads the entity list **from token claims** instead of from a tenant-membership API.

What to check:

- The IdP/login flow: when the user signs in, is the resulting JWT/ID token scoped to a single `tenant_id` / `org_id` / `company_id`?
- Is the Company Admin top-bar component reading entities from `decodedToken.tenants` / `decodedToken.companies` instead of calling a `/me/tenants` (or `/users/{id}/companies`) endpoint?
- Is there a "switch tenant" flow that only re-issues a token for the chosen tenant, and on first login the token only includes the default/primary tenant?

Why this matches: it perfectly explains "I can deep-link to the other entity, but the switcher does not show it" — the switcher is bound to a token that does not enumerate every membership.

### H2. Entity list call is filtered by the currently active tenant context

Even when the API returns entities, many Command Alkon style services apply a **tenant context middleware** (usually a header like `X-Tenant-Id`, `X-Company-Id`, or a path segment `/tenants/{id}/...`). If the entity-membership endpoint is mounted under that scoped path, it will only ever return memberships for the **currently active tenant** — i.e., one row.

What to check:

- Is the tenant list endpoint (e.g., `GET /api/admin/companies` or `GET /api/users/me/companies`) mounted under a tenant-scoped router?
- Is there middleware that injects a `WHERE tenant_id = :current` filter globally? Membership / cross-tenant lookups must be **explicitly exempted**.
- Does the controller call a repository that joins `users` -> `user_tenants` and apply a default tenant filter?

### H3. Membership table is being read with the wrong identifier

In Command Alkon products there are typically multiple identifiers for a "user":

- The IdP subject (`sub`, e.g., Auth0/Okta user id)
- The internal Carbon-Accounting `user_id`
- The Customer Admin (Master Data) `customer_id` / `contact_id`

If the company-admin selector resolves memberships using the wrong key (e.g., the IdP subject instead of the internal user id, or vice-versa), users created via different paths (SSO vs. invited vs. provisioned through Master Data) will only match for **one** of the entities they were assigned to.

What to check:

- The membership query: which column is used in the `WHERE` clause? Compare to how invites/provisioning writes that column.
- Are there users with multiple rows in `users` (one per tenant) keyed by tenant + email, instead of one user with N memberships? This is a known anti-pattern that produces exactly this symptom.
- Audit a known-broken user: query `user_tenants` / `user_companies` directly by email. If the row count matches the expectation but the API still returns fewer, it is H1, H2, or H4. If the DB itself only has one row, it is a provisioning bug (H5).

### H4. Front-end caches/persists the first response (state hydration)

The Company Admin top-bar may be hydrated once from a Redux/Zustand/Context store on first load (or from `localStorage` / `sessionStorage`) and **not refreshed** when a tenant context changes or when membership is updated.

What to check:

- The top-bar component's data source: is it a hook like `useCurrentUserCompanies()` that subscribes to live data, or a one-time call in `App.tsx` / `Layout.tsx`?
- Is the list keyed by `tenantId` in the cache, so each tenant context has its own (truncated) cached list?
- Is React Query / SWR configured with `staleTime: Infinity` for that query, blocking refresh?
- Is there a `localStorage.setItem('companies', ...)` write that pins the original response and is read on every page load?

### H5. Provisioning / invite flow only links the user to one tenant at a time

If admins onboarding the user through the Carbon-Accounting EXP "invite to company" flow create a **fresh user record per tenant** (instead of linking the existing user to an additional tenant), then in the database the same person is N separate users. They will only ever log in as one of them at a time.

What to check:

- The invite controller: does it `findOrCreate` by email across all tenants, then add a `user_tenants` row, or does it `create` unconditionally and scope by tenant?
- The Customer/Master Data sync: when Master Data assigns a contact to multiple companies, does Carbon-Accounting EXP receive one event with N companies, or N events that each create a new user?

### H6. Roles/permissions filter the picker (not the membership)

A frequently overlooked cause: the user **is** linked to all entities, but the Company Admin top-bar filters to entities where the user has the `company_admin` (or equivalent) role. If they are only an admin on one entity and a regular user on the others, only the admin one shows up.

What to check:

- The picker query / selector: does it filter `WHERE role IN ('company_admin', 'tenant_admin')`?
- Is the label "Company Admin" describing the **role required to see the dropdown** rather than the area's name?
- Compare what shows up to the user's role grants per tenant.

### H7. Pagination / hard limit on the membership endpoint

If the endpoint returns memberships paginated and the UI only consumes page 1 (with a small default `pageSize`), users with many memberships will see a truncated list. Less likely for users with only 2–3 tenants, but worth ruling out for the bigger customers.

What to check:

- Default `pageSize` on the memberships endpoint.
- Whether the picker requests subsequent pages or expects all results in one shot.

## Where to look in the Carbon-Accounting EXP codebase

These are the files/areas to grep first when the engineer opens the actual repo. Names are best-guesses based on Command Alkon platform conventions; substitute real names as found.

### Front-end (likely React + TypeScript)

- `src/layout/TopBar/CompanyAdmin*` / `CompanySwitcher*` / `TenantSwitcher*`
- `src/hooks/useCompanies.ts`, `useTenants.ts`, `useCurrentUser.ts`, `useMemberships.ts`
- `src/auth/*` — token decoding, claims extraction, where `tenants` / `companies` claim is read
- `src/store/` (Redux/Zustand) — slices named `auth`, `tenant`, `company`, `session`
- API client wrappers — look for `X-Tenant-Id` / `X-Company-Id` injection in axios/fetch interceptors
- React Query configuration: `staleTime`, `cacheTime`, query keys for the membership query

Grep terms in the FE:
- `companies`, `tenants`, `memberships`, `switchCompany`, `setActiveTenant`
- `X-Tenant`, `X-Company`, `tenantId`, `companyId`
- `localStorage`, `sessionStorage` accesses for tenant data

### Back-end (likely .NET / Node depending on service)

- Identity / membership endpoint controllers: `MeController`, `UsersController`, `MembershipsController`, `CompaniesController`
- Tenant resolution middleware: `TenantContextMiddleware`, `TenantResolver`, `CurrentTenantAccessor`
- Repositories that read `user_tenants` / `user_companies` / `memberships`
- Authorization policies that gate the "list my companies" endpoint

Grep terms in the BE:
- `current_tenant`, `CurrentTenantId`, `tenant_id =`, `companyId ==`
- `GetCompanies`, `GetTenants`, `ListMemberships`, `MyCompanies`
- `[Authorize(Policy = `, role checks like `company_admin`

### Identity provider / token shape

- The IdP rules / actions / hooks that compose the access token. Look for an action that injects a `tenants` or `companies` claim — verify it iterates **all** memberships, not just a primary one.
- The login callback: does it pick a default tenant and re-issue a tenant-scoped token before the SPA boots?

## Diagnostic steps (in order)

Run these against a known-broken user (one who has been assigned to ≥2 entities and only sees a subset):

1. **DB truth check.** Query the membership table directly:
   `SELECT * FROM user_companies WHERE user_id = :id;` (or equivalent). Confirm how many rows actually exist. This isolates provisioning (H5) vs. read-path bugs.
2. **API truth check.** As that user, hit the membership endpoint directly (e.g., `GET /api/users/me/companies`) with their bearer token in a tool like Postman / curl. Compare the count to step 1.
   - If API returns fewer than DB has → it is H2, H3, or H6 (server-side filter).
   - If API returns the full list but the UI shows fewer → it is H4 (front-end caching/hydration) or H1 (UI is reading from token, not API).
3. **Token inspection.** Decode the access token at jwt.io. Check for `tenants`, `companies`, `org_ids`, or similar claims. If the UI is bound to those claims and they are incomplete, that is H1.
4. **Network trace in the browser.** With DevTools open, hard-refresh and watch the request the top bar makes. Confirm:
   - the URL (is it tenant-scoped?),
   - the request headers (`X-Tenant-Id` injected?),
   - the response body (what it actually returns).
5. **Role audit.** For each entity the user expects, check the user's role on that entity. If the missing ones are non-admin, that is H6.

A single user who fails steps 1+2+3 in different ways will pinpoint whether the bug is provisioning, server filter, token, or client cache.

## Suggested fixes per cause

| Cause | Fix outline |
| --- | --- |
| H1 — token holds one tenant | Replace token-claim read with a call to `/users/me/companies`. Or: change IdP rule so the access token enumerates **all** active memberships in a `companies` claim. |
| H2 — endpoint scoped by current tenant | Move the membership endpoint to a non-tenant-scoped route, or explicitly bypass the tenant filter for membership lookups. Add a unit test for "user with N tenants returns N rows." |
| H3 — wrong identifier | Standardize on one user identifier across services. Backfill the membership table to use it. Add an FK + uniqueness on `(user_id, company_id)`. |
| H4 — FE cache | Make the top-bar query independent of the active-tenant query key, set a sensible `staleTime`, invalidate on tenant switch and on membership change events. Remove `localStorage` pinning. |
| H5 — duplicate users per tenant | In the invite/provisioning path, `findOrCreate` user by canonical email/IdP subject and add a membership row. One-time migration to merge duplicates. |
| H6 — role filter on picker | If "Company Admin" is the area name, drop the role filter on the **switcher** (still gate the page contents by role). If it is the role gate, list all entities and indicate read-only ones. |
| H7 — pagination | Either request all pages or raise the default page size with a hard cap that exceeds realistic membership counts. |

## Recommended next actions

1. Pick **one verified-broken user** in a non-prod tenant and walk steps 1–5 above. The output of those five checks is sufficient to choose between H1–H7.
2. Add an integration test in Carbon-Accounting EXP: "user with memberships in tenant A and tenant B, when calling `GET /users/me/companies`, sees both A and B regardless of active tenant context." This test alone would have caught H2/H3/H6.
3. Add an end-to-end Playwright/Cypress test that logs in as a multi-tenant user and asserts the top-bar selector shows N entries.
4. Once the fix lands, audit existing customer accounts for orphaned/duplicate user records (cleanup for H5) and re-run the support tickets.

## Open questions for the team

- Does Carbon-Accounting EXP get its tenant memberships from Master Data / Customer Admin, or does it own its own membership table?
- Which IdP is in use (Auth0, Okta, Cognito, Microsoft Identity), and does the access token currently contain a multi-valued tenant claim?
- Is the top-bar component shared with another Command Alkon product (e.g., reused from the platform shell)? If so, the bug may live in the shared shell, not in EXP itself.
- Are the affected customers all Series-imported, all SSO-onboarded, or a mix? A common channel points to a specific provisioning path.

---
*Status: investigation brief / prototype analysis. To be paired against the real `Carbon-Accounting-EXP` repo to confirm and pick the actual fix.*
