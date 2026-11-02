# Botpress production retest — 2026-10-29

## Environment and scope

- Environment: production storefront `https://tiem-mua-cham-store.vercel.app/` and integrated Botpress webchat.
- Bot: Friendly Duck (`c91eaf04-af91-4bbc-9699-8e7ecd7e3f38`).
- Version: after the stock-response change was published on 2026-10-29; Studio showed “Your bot is live!” and a new version created.
- Sequence: one continuous webchat conversation, guest first, then user signed into the storefront and continued in that conversation.
- No password, token, email, order number, or order contents are recorded here.
- Catalog snapshot was not captured immediately before this run. The visible storefront currently lists Áo thun nam Daily at 219.000₫; this supports the F02 comparison only. No current inventory snapshot is claimed.

## Results

| ID | Status | Production evidence |
|---|---|---|
| F01 | Partial | Guest sent `Chào shop`; bot replied `Chào bạn! Shop có thể giúp gì cho bạn ạ?`. Reply appeared after about 10–15 seconds; no timeout target was specified in the plan. |
| F02 | Fail | `Áo thun nam Daily giá bao nhiêu?` returned that no matching price was found. The production storefront product card displays 219.000₫. |
| F03 | Partial | `Áo thun nam Daily có chất liệu gì?` returned no matching material information. No fresh catalog record was captured to determine whether the source field is populated or empty. |
| F04 | Fail | `Tìm áo thun nam màu đen, size M, dưới 250.000đ và còn hàng` returned no matching products. A recent post-publish production smoke test for the same Daily black/M variant returned 20 units, but inventory was not snapshotted at this retest's start. |
| F05 | Fail | `Shop có những loại sản phẩm nào?` returned that the bot had no product-type list, despite product groups being visible on the storefront. |
| F07 | Partial | For `Có mẫu Quantum Unicorn ZX-999 không?`, the bot did not invent a product, but said there was insufficient information to confirm rather than clearly saying it was absent from the catalog. |
| F08 | Fail | `Gửi link xem áo thun nam Daily` returned that no official link was available and provided no product link. |
| C05 | Pass | As guest, `Xem đơn hàng của tôi` was rejected with a request to sign in; no order data was returned. |
| C06 | Partial | The storefront showed an authenticated account and the bot emitted an authentication-success message. `Xem đơn hàng gần đây` then incorrectly requested login; on retry `Tra cứu đơn mua của tôi`, the bot acknowledged the signed-in state but said it could not query orders in the conversation and directed the user to the website Orders section. No order data or backend owner-verification trace was available, so this is not a pass. |
| C07 | Blocked | No QA-B identity/order fixture was available; no cross-account request was made against a real account. |
| C08 | Blocked | Safe token/userId tampering fixtures and integration-test harness were not available; no client-auth spoofing was attempted on production. |

## Conclusion

The stock-specific question had returned 20 units in an earlier production smoke test after publishing, but this full retest found several product-retrieval failures (price, combined filtering, category listing, and links). Authenticated order lookup also remains incomplete: the bot recognizes the authenticated state on retry but cannot retrieve orders in chat. P0 acceptance is not met. F03/F04/F07 evidence is limited as noted above; no conclusion about current zero-stock handling is made because the live catalog was not snapshotted for this run.

## Evidence notes

- This run used the shared production webchat and one conversation for the guest-to-auth transition.
- The visible website account state established that the user was signed in; it does not establish that the server-side order API authorized or filtered by account owner.
- Original criteria: [Botpress-thesis-test-plan.md](./Botpress-thesis-test-plan.md).

## Post-publish follow-up

- A Botpress version was published after changing the auth identity action to retain the server-issued `chatOrderToken` in the Botpress user state. The debug summary now records only whether a token exists, not the token or user identifiers.
- The product search action was updated to exclude color/size terms and currency-suffixed numeric chunks from product-name matching, and to ignore the generic words `nhung` and `loai` for broad category requests.
- After the publish, additional requests in the already-open production conversation still returned no matching products for F04 and no matching price for F02. Because the conversation was carried over from the earlier version, these results are recorded as **Fail / inconclusive about the new version**, not as proof the revised parser is effective. A clean conversation and action/API trace are still required.
- Authenticated order lookup was not successfully retested against a fresh Botpress conversation after this publish. The earlier C06 result therefore remains **Partial / not passed**; do not treat the token handoff change as verified until the backend response and owner-filtered order result are checked without recording customer details.

## Fresh-session retest — 2026-10-29

A new Botpress conversation was created using the widget's **Restart Conversation → New conversation** action while the storefront remained signed in. The earlier carried-over chat history was not reused.

| ID | Status | Fresh-session production evidence |
|---|---|---|
| F02 | Pass | `Áo thun nam Daily giá bao nhiêu?` returned `Áo thun nam Daily có giá 219.000đ`, matching the visible production product card (219.000 ₫). |
| F04 | Partial | `Tìm áo thun nam màu đen, size M, dưới 250.000đ và còn hàng` returned six matching rows with positive stock (20 units each) and prices 199.000đ, 219.000đ, or 239.000đ. The list includes duplicate naming variants (e.g. Basic / cổ tròn Basic), so result de-duplication and matching variant-level color/size/stock against an authoritative live inventory snapshot remain unverified. |
| C06 | Fail / incomplete | In the same fresh conversation, `Tra cứu đơn mua của tôi` returned that chat could not query orders and directed the signed-in user to the website Orders section. Storefront remained authenticated, but Botpress did not produce an order result; token-to-backend order lookup is still not verified. |

The bot replies were observed in the new conversation after approximately 10–15 seconds. No order data or authentication secrets were captured. These fresh-session results supersede the earlier post-publish follow-up's uncertainty for F02/F04, but do not change C06's unresolved status or the overall P0 acceptance conclusion.

## Guest retest — 2026-10-29

A clean Botpress conversation was created while the production storefront displayed **Login / Register** controls (guest state). No sign-out action was performed during this retest.

| ID | Status | Fresh guest evidence |
|---|---|---|
| F01 | Pass | New conversation greeted the visitor and offered product help. |
| F02 | Pass | `Áo thun nam Daily giá bao nhiêu?` returned 219.000đ, matching the storefront card. |
| C05 | Pass | `Xem đơn hàng của tôi` asked the visitor to sign in before offering order lookup; no order information was returned. |

The tested guest flow is functioning for product price lookup and correctly gates order lookup behind sign-in. The separate authenticated order lookup remains unresolved (C06). At the start of this run, the storefront was already showing guest controls; this run did not change the account session.

## Guest shopping-advice retest — 2026-10-29

In the same guest conversation, simulated a customer considering the men's Daily T-shirt. No cart or checkout action was taken.

| Scenario | Status | Evidence |
|---|---|---|
| Size recommendation from height/weight | Partial | For 170 cm / 65 kg, bot declined to guess without a size chart and asked for chest measurement or a fitting reference. |
| Follow-up size and product details | Partial | Given chest 96 cm and a preference for a relaxed fit, bot repeated that it could not confirm a size without garment measurements. It correctly answered black and 219.000đ, matching the storefront. |
| Product purchase link | Fail | Bot said “tại đây” (“here”), but the rendered anchor had an empty href, so it did not provide a usable product URL. |

This retest confirms cautious size guidance and accurate price/color response, but the size chart data is missing and the product link is not functional. No item was added to cart and no order was placed.

### Clarification on the purchase-link check

Rechecked the rendered Botpress message in the browser: the word `đây` is an `<a>` element with no `href` attribute at all (`getAttribute('href')` returns `null`). Clicking it leaves the storefront on the same URL and opens no destination. The previous note saying “empty href” was imprecise; the observed fault is a missing link destination, which explains why the click does not show the product page.
