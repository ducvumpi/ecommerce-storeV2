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

No production pass is claimed for A02/A05/A06/A07 or the reload behavior until the code is deployed. The Botpress flow itself was not editable from the currently available Studio page in this run, so publication of the flow-level silent `tokenRefreshOnly` branch remains unverified. Re-test after deploying the website and publishing the Botpress flow; keep the same conversation for the reload scenario as requested.
