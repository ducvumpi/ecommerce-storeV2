# Auth and greeting remediation retest — 2026-11-20

Baseline: [Botpress-thesis-auth-test-run-2026-11-20.md](./Botpress-thesis-auth-test-run-2026-11-20.md). Changes in this report are local to the current workspace and are not deployed to the production Vercel site or published to Botpress.

## Findings and changes

| Case / symptom | Change | Local result |
|---|---|---|
| A02 — profile values and invalid date warning | Profile name/email now fall back to Supabase auth metadata; absent phone/date/gender remain blank instead of showing a fabricated value. Removed the invalid `31/01/1990` date default. | Partial: code compiles; current account has no verified phone/date/gender values, so those fields must remain empty until supplied by the user. |
| A05 — login page while already authenticated | Authenticated users are redirected to `/` and the form is not rendered. | Implemented; runtime retest requires deployment. |
| A06 — registration page while already authenticated | Authenticated users are redirected to `/` and the form is not rendered. | Implemented; runtime retest requires deployment. |
| A07 — `/settings` returns 404 | Added `/settings` route redirecting to `/info`. | Implemented; runtime retest requires deployment. |
| Reload repeats auth greeting | Identity is persisted across conversation IDs. Re-entry for the same authenticated identity uses `tokenRefreshOnly`; initial order-token refresh is delayed to prevent racing the identity event. Duplicate greetings are hidden in the restored transcript. | Implemented; runtime retest requires deployment and Botpress confirmation that `tokenRefreshOnly` is a silent branch. |
| “Không tìm thấy sản phẩm khớp chính xác…” immediately after greeting | Prevented the parallel token refresh trigger on page load; the UI hides this exact fallback only when no user message has arrived since the latest greeting. | The production page currently shows repeated greeting/fallback pairs in the shared transcript. The local fix cannot be verified on production until deployed; Botpress workflow behavior still needs a published-flow check. |

## Validation

- `npx.cmd tsc --noEmit`: passed after the local changes.
- `npm.cmd run build`: could not be verified. The sandboxed attempt failed fetching existing Google Fonts; the network-enabled retry produced no output and was stopped after it remained stalled.
- Targeted ESLint could not run: the repository has no ESLint flat config; legacy mode fails while serializing the existing `.eslintrc.json` plugin configuration.
- Production browser observation: the shared transcript contains repeated auth greetings, each followed by the exact product fallback, without a customer message between them. This confirms the reported symptom; it is baseline evidence, not a retest of the local patch.

## Retest status

At the time of the initial local verification, no production pass was claimed because deployment had not yet been reported. The subsequent production retest is recorded below. The Botpress Studio flow itself was not editable from the available page, so its `tokenRefreshOnly` branch was not directly inspected; the browser retest verifies the observed user-facing behavior on the tested existing conversation.

## Production retest — 2026-11-20

After the user reported deployment, the shared authenticated production browser was retested without logging out, changing profile data, or creating a new chat conversation.

| Case | Result | Evidence |
|---|---|---|
| A01 — authenticated session | Pass | Navbar still displays the signed-in member after reload and route navigation. |
| A02 — profile | Partial | Profile loads the authenticated email. Name remains the generic “Người dùng”; phone and date of birth are empty in the account data. No fake date is displayed. |
| A03 — orders | Pass | `/orders` finishes loading and displays 2 orders. |
| A05 — login while authenticated | Pass | `/auth/login` redirects to `/`; login form is not shown. |
| A06 — register while authenticated | Pass | `/auth/register` redirects to `/`; registration form is not shown. |
| A07 — settings route | Pass | `/settings` redirects to `/info` instead of returning 404. |
| Reload greeting / empty product fallback | Pass for the tested reload | Reload preserved the existing transcript. It showed one greeting total and no new “Không tìm thấy sản phẩm khớp chính xác…” response after reload without a new user message. |
| A09 / auth conversation continuity | Pass for the restored transcript | Existing order lookup and product consultation messages remained in the same Botpress conversation; no new conversation was started. |

The profile remains Partial because the account has no verified name, phone, or date-of-birth values to display. The browser showed unrelated font request blocks and 404 resource errors; they did not prevent these Auth pages from loading. This retest does not prove the behavior for a brand-new conversation or every Botpress workflow path.
