# Botpress Partial-case fixes — 2026-11-13

## Scope

Revalidated the guest product-advisory workflow in Botpress Studio Emulator and published the corrections to the Friendly Duck bot.

## Partial cases and results

| Case | Test | Result |
| --- | --- | --- |
| G03 — requested size fallback | `Áo len nữ Weekend màu nâu size M, nếu không còn M thì size S cũng được, dưới 400 nghìn.` | **PASS.** M was unavailable; the answer returned only Nâu / S with stock 40. |
| G08 — unavailable SKU clarification | Ask for `Quantum Unicorn ZX-999`, fallback under 300,000đ, dark colors, size M; then answer `Áo thun nam`. | **PASS.** The follow-up returned 13 matching products; returned rows were men’s clothing, within budget, dark colors and size M. |
| G10 — vague “best” request and color refinement | Ask for the “best” product, specify women’s everyday clothing around 300,000đ, then ask about black. | **PASS.** The bot clarified the product type; on the black follow-up it acknowledged the color and preserved the budget and product group, offering a higher budget or unisex options without silently relaxing filters. |

## Full production guest regression

| Check | Result |
| --- | --- |
| Guest entry and greeting | **PASS.** Signed-out navigation shows Login/Register; the chat welcome message explains order lookup requires sign-in. |
| G03 size fallback | **PASS.** M sold out → Nâu/S available, stock 40. |
| G08 unknown SKU and clarification | **PASS.** Unknown SKU requests a type; `Áo thun nam` returns 13 items matching gender, ≤300,000đ, dark colors and size M. |
| G10 vague request and constraint refinement | **PASS.** Clarifies type, keeps the ~300,000đ women’s constraint, acknowledges black, and does not silently broaden filters. |
| Direct product search | **PASS.** Black/M men’s T-shirts under 250,000đ and in stock returned 7 matches. |
| Unverified policy question | **PASS.** Does not invent exchange/shipping policy; points to the relevant help page/support. |
| Guest order lookup | **PASS.** Requires reauthentication; no order/customer details are exposed. |
| Product card → product detail / variant stock | **PASS.** Link opens the correct product; Black/M is purchasable, Black/S is disabled, and listed price matches (199,000đ). |
| Guest add-to-cart | **PARTIAL.** `Thêm vào giỏ hàng` redirects to `/auth/login`; the cart stays empty. This is a blocker only if anonymous carts are required by the product specification. |
| Guest cart access | **PASS.** `/cart` is accessible signed out and shows the empty-cart state. |

## Validation

- Botpress Emulator: all three targeted flows passed after correction, including the sequential clarification turns in the same emulator conversation.
- Production storefront guest widget: G03, G08 clarification and follow-up, G10 clarification/budget/color refinement, a direct available-products search, a policy question, and the order lookup guard were tested in the same guest chat. Product/advisory cases returned catalog-backed answers; the policy answer did not invent shipping or exchange terms; order lookup prompted for authentication and showed no order/customer data.
- Production storefront product/cart path: selected the chatbot-recommended product and a live in-stock Black/M variant. The product page matched the chatbot price (199,000đ), disabled Black/S, and enabled `Thêm vào giỏ hàng` after selecting Black/M. Clicking that button as guest redirected to `/auth/login`; the cart remained empty. **PARTIAL / requirement-dependent:** anonymous product discovery works, but anonymous add-to-cart is gated behind login. No order was submitted.
- Guest page boundary: the header showed `Đăng nhập` / `Đăng ký`, product pages and the empty cart were reachable while logged out, and the chatbot remained available across those pages.
- Local action regression: `node qa-reports/botpress-guest-fix-2026-11-09/regression.cjs` — **23 passed** using mocked HTTP data and the public catalog snapshot.
- The response action had zero Monaco TypeScript error markers before publish.
- Botpress Studio reported **“Bot published successfully!”** and “Last published 1 second ago.”

## Limits

The production responses took roughly 10–25 seconds to render in the browser. The checks reused the already-open guest chat and did not restart or create additional conversations. No order was submitted.
