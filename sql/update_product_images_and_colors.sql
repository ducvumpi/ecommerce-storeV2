-- One atomic SQL statement. No temporary table or session dependency.
-- Updates the 45 seeded products and inserts missing color/size variants.
WITH seed_product_images (
  slug, category_id, name, description, image_url, colors
) AS (
  VALUES
  ('ao-thun-nam-trang-basic', 21, 'Áo thun nam Basic', 'Áo thun nam Basic. Ảnh minh họa màu xanh navy. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/asr/e9a38112-ee79-434d-8b5a-52945525de02.e1653953e7d17a159aa9c5f84f446b0e.jpeg?odnBg=FFFFFF&odnHeight=580&odnWidth=580', ARRAY['Xanh navy', 'Trắng', 'Đen']::text[]),
  ('ao-thun-nam-trang-daily', 21, 'Áo thun nam Daily', 'Áo thun nam Daily. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://intotheam.com/cdn/shop/files/NonBranded_Basic_Mens_Tee_Black_Front_e3e49aa7-fcd6-48e0-b0b3-196141c30dc7.jpg?v=1778169460&width=400', ARRAY['Đen', 'Trắng', 'Xanh navy']::text[]),
  ('ao-thun-nam-trang-weekend', 21, 'Áo thun nam Weekend', 'Áo thun nam Weekend. Ảnh minh họa màu xanh dương. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://5.imimg.com/data5/XQ/IH/MY-29746767/t-shirt-500x500.jpg', ARRAY['Xanh dương', 'Trắng', 'Đen']::text[]),
  ('ao-thun-nam-trang-urban', 21, 'Áo thun nam Urban', 'Áo thun nam Urban. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://media.gq.com/photos/67f561e3a37572082491d5e9/3%3A4/w_748%2Cc_limit/11.jpg', ARRAY['Đen', 'Trắng', 'Xanh navy']::text[]),
  ('ao-thun-nam-trang-premium', 21, 'Áo thun nam Premium', 'Áo thun nam Premium. Ảnh minh họa màu trắng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://media.splashfashions.com/i/splash/7409799-HQ174190-SP26081025_04-2100.jpg?%24prodimg-d-prt-pdp-2x%24=&%24quality-standard%24=&sm=c&v=1%3Ffmt%3Dauto', ARRAY['Trắng', 'Đen', 'Xanh navy']::text[]),
  ('ao-so-mi-nam-trang-cong-so', 22, 'Áo sơ mi nam Basic', 'Áo sơ mi nam Basic. Ảnh minh họa màu trắng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://www.henryandgray.co.nz/cdn/shop/products/79e3668666c9e0cb012a89ecd9d4273f.jpg?v=1707792460&width=1920', ARRAY['Trắng', 'Xám', 'Xanh nhạt']::text[]),
  ('ao-so-mi-nam-trang-daily', 22, 'Áo sơ mi nam Daily', 'Áo sơ mi nam Daily. Ảnh minh họa màu xám. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://www.iswmenswear.com/cdn/shop/files/P720ET0R-GRY_1_467x700.png?v=1698163503', ARRAY['Xám', 'Trắng', 'Xanh nhạt']::text[]),
  ('ao-so-mi-nam-trang-weekend', 22, 'Áo sơ mi nam Weekend', 'Áo sơ mi nam Weekend. Ảnh minh họa màu xanh nhạt. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://img.myshopline.com/image/store/1690170976590/RSL185WF43R-50.jpeg?h=2000&w=2000', ARRAY['Xanh nhạt', 'Trắng', 'Xám']::text[]),
  ('ao-so-mi-nam-trang-urban', 22, 'Áo sơ mi nam Urban', 'Áo sơ mi nam Urban. Ảnh minh họa màu trắng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://my.sacoorbrothers.com/cdn/shop/files/8ebbc94bb17cad24beda299391d3f984.jpg?crop=region&crop_height=1920&crop_left=76&crop_top=0&crop_width=1286&v=1751031305&width=1440', ARRAY['Trắng', 'Xám', 'Xanh nhạt']::text[]),
  ('ao-so-mi-nam-trang-premium', 22, 'Áo sơ mi nam Premium', 'Áo sơ mi nam Premium. Ảnh minh họa màu xanh nhạt. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/asr/d86a5a9b-4443-491b-8400-90bbc2a5bdcc.82305a5e44c8db193c4a3e0252302cf3.jpeg', ARRAY['Xanh nhạt', 'Trắng', 'Xám']::text[]),
  ('quan-jeans-nam-basic', 23, 'Quần jeans nam Basic', 'Quần jeans nam Basic. Ảnh minh họa màu xanh nhạt. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://outfitters.com.pk/cdn/shop/files/F0572109629_2.jpg?v=1741754619&width=533', ARRAY['Xanh nhạt', 'Xanh denim', 'Đen']::text[]),
  ('quan-jeans-nam-daily', 23, 'Quần jeans nam Daily', 'Quần jeans nam Daily. Ảnh minh họa màu xanh denim. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://n7media.coolmate.me/uploads/July2024/Quan_Jeans_Nam_dang_Slim_Fit_V2.Xanh_duong.Collection.jpg?aio=w-585', ARRAY['Xanh denim', 'Đen', 'Xanh nhạt']::text[]),
  ('quan-jeans-nam-weekend', 23, 'Quần jeans nam Weekend', 'Quần jeans nam Weekend. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://th-live-01.slatic.net/p/9ce157f87c8d6baa49bc2dc795f9d38a.jpg', ARRAY['Đen', 'Xanh denim', 'Xanh nhạt']::text[]),
  ('quan-jeans-nam-urban', 23, 'Quần jeans nam Urban', 'Quần jeans nam Urban. Ảnh minh họa màu xanh đậm. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cf.shopee.co.th/file/sg-11134201-22120-bph1c63o25kv8d', ARRAY['Xanh đậm', 'Xanh denim', 'Đen']::text[]),
  ('quan-jeans-nam-premium', 23, 'Quần jeans nam Premium', 'Quần jeans nam Premium. Ảnh minh họa màu xanh đậm. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://img.drz.lazcdn.com/static/bd/p/bde3ad5c8fe5346333a661739f47934b.jpg_720x720q80.jpg', ARRAY['Xanh đậm', 'Xanh denim', 'Đen']::text[]),
  ('bo-pijama-nam-basic', 24, 'Bộ pijama nam Basic', 'Bộ pijama nam Basic. Ảnh minh họa màu xám. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://f.nooncdn.com/p/pzsku/Z25765A88F5A30416E508Z/45/_/1729924919/1d61531a-fe20-4207-bdfe-7e29abfb794d.jpg?width=800', ARRAY['Xám', 'Xanh xám', 'Xanh navy']::text[]),
  ('bo-pijama-nam-daily', 24, 'Bộ pijama nam Daily', 'Bộ pijama nam Daily. Ảnh minh họa màu kẻ xám. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://www.noblemount.com/cdn/shop/products/twb_mn_wctn_pjsetSH_7C-120_NV_819f9690-2430-48eb-9c3c-391e0403f428.jpg?v=1605234385', ARRAY['Kẻ xám', 'Xanh xám', 'Xám']::text[]),
  ('bo-pijama-nam-weekend', 24, 'Bộ pijama nam Weekend', 'Bộ pijama nam Weekend. Ảnh minh họa màu kẻ xám. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://img.alicdn.com/i1/2568167041/O1CN01pjQqCA21spWm2Mesd_%21%212568167041.jpg', ARRAY['Kẻ xám', 'Xanh xám', 'Xám']::text[]),
  ('bo-pijama-nam-urban', 24, 'Bộ pijama nam Urban', 'Bộ pijama nam Urban. Ảnh minh họa màu kẻ xanh. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://shoppingmania-boutique.com/cdn/shop/products/S9e06566f98894b718782d20d672f64fd0_1024x1024.jpg?v=1675072875', ARRAY['Kẻ xanh', 'Xanh xám', 'Xám']::text[]),
  ('bo-pijama-nam-premium', 24, 'Bộ pijama nam Premium', 'Bộ pijama nam Premium. Ảnh minh họa màu kẻ xanh trắng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://dojiw2m9tvv09.cloudfront.net/118437/product/F_pv1057la6560.png?60=&t=1781812969', ARRAY['Kẻ xanh trắng', 'Xanh xám', 'Xám']::text[]),
  ('ao-len-nu-mau-kem', 25, 'Áo len nữ Basic', 'Áo len nữ Basic. Ảnh minh họa màu nâu. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://allbrandsfactoryoutlet.com/cdn/shop/files/760599_b6d31399-d89f-4955-99a8-39ea071dfb65.jpg?crop=center&height=1200&v=1764157575&width=1200', ARRAY['Nâu', 'Kem', 'Be']::text[]),
  ('ao-len-nu-mau-kem-daily', 25, 'Áo len nữ Daily', 'Áo len nữ Daily. Ảnh minh họa màu kem. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://assets.manufactum.de/assets/img/0014/00148280/0014828081-01.jpg/pull-over-maille-femme.jpg?profile=produktliste_750', ARRAY['Kem', 'Be', 'Nâu']::text[]),
  ('ao-len-nu-mau-kem-weekend', 25, 'Áo len nữ Weekend', 'Áo len nữ Weekend. Ảnh minh họa màu be. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdn02.outlet46.de/item/images/224157/middle/909761_2.jpg', ARRAY['Be', 'Kem', 'Nâu']::text[]),
  ('ao-len-nu-mau-kem-urban', 25, 'Áo len nữ Urban', 'Áo len nữ Urban. Ảnh minh họa màu kem. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://image.hm.com/assets/hm/ac/bb/acbbe352fc40affb44450e96904f17cbb1a72362.jpg?imwidth=1260', ARRAY['Kem', 'Be', 'Nâu']::text[]),
  ('ao-len-nu-mau-kem-premium', 25, 'Áo len nữ Premium', 'Áo len nữ Premium. Ảnh minh họa màu be. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/seo/QASIEATN-Fall-Sweaters-for-Women-Fashion-Women-s-Knitted-Sweater-Women-s-Clothing-Thick-Thread-High-Neck-Pullover-Sweater-Women_0f8111be-21b3-4f61-b263-ba3ba7f742a3.3e49ee11811dbee577bd1e722f432169.jpeg', ARRAY['Be', 'Kem', 'Nâu']::text[]),
  ('vay-maxi-nu-hoa-tiet-hoa', 26, 'Váy maxi nữ họa tiết hoa Basic', 'Váy maxi nữ họa tiết hoa Basic. Ảnh minh họa màu hoa nền kem. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://www.lulus.com/images/product/xlarge/2015862_349862.jpg?w=560', ARRAY['Hoa nền kem', 'Hoa hồng', 'Hoa xanh']::text[]),
  ('vay-maxi-nu-hoa-tiet-hoa-daily', 26, 'Váy maxi nữ họa tiết hoa Daily', 'Váy maxi nữ họa tiết hoa Daily. Ảnh minh họa màu hoa nhiều màu. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdna.lystit.com/400/500/tr/photos/zappos/3853c8e0/betsy-adam-Multi-Long-Floral-Flare-Sleeve-Dress.jpeg', ARRAY['Hoa nhiều màu', 'Hoa nền kem', 'Hoa hồng']::text[]),
  ('vay-maxi-nu-hoa-tiet-hoa-weekend', 26, 'Váy maxi nữ họa tiết hoa Weekend', 'Váy maxi nữ họa tiết hoa Weekend. Ảnh minh họa màu hoa hồng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://curveproject.com.au/cdn/shop/files/CP_24595_669_1024x1024.jpg?v=1730890893', ARRAY['Hoa hồng', 'Hoa nền kem', 'Hoa xanh']::text[]),
  ('vay-maxi-nu-hoa-tiet-hoa-urban', 26, 'Váy maxi nữ họa tiết hoa Urban', 'Váy maxi nữ họa tiết hoa Urban. Ảnh minh họa màu hoa đỏ vàng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cinderellasclosetboutique.com/cdn/shop/files/20935596_8133f91e-ff1f-4598-bc05-226254ad849c.jpg?v=1718062390', ARRAY['Hoa đỏ vàng', 'Hoa nền kem', 'Hoa hồng']::text[]),
  ('vay-maxi-nu-hoa-tiet-hoa-premium', 26, 'Váy maxi nữ họa tiết hoa Premium', 'Váy maxi nữ họa tiết hoa Premium. Ảnh minh họa màu hoa nền kem. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://eclipsestores.com/cdn/shop/files/00212-2243-011-1.jpg?v=1772165237', ARRAY['Hoa nền kem', 'Hoa hồng', 'Hoa xanh']::text[]),
  ('bo-do-ngu-nu-satin-basic', 27, 'Bộ đồ ngủ nữ satin Basic', 'Bộ đồ ngủ nữ satin Basic. Ảnh minh họa màu hồng nhạt. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://images-na.ssl-images-amazon.com/images/I/71oU23Oj5EL.jpg', ARRAY['Hồng nhạt', 'Đen', 'Champagne']::text[]),
  ('bo-do-ngu-nu-satin-daily', 27, 'Bộ đồ ngủ nữ satin Daily', 'Bộ đồ ngủ nữ satin Daily. Ảnh minh họa màu đỏ rượu. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://m.media-amazon.com/images/I/71GHsoQV0hL.jpg', ARRAY['Đỏ rượu', 'Hồng nhạt', 'Đen']::text[]),
  ('bo-do-ngu-nu-satin-weekend', 27, 'Bộ đồ ngủ nữ satin Weekend', 'Bộ đồ ngủ nữ satin Weekend. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/seo/U2SKIIN-Silk-Pajamas-for-Women-Shorts-Set-Short-Sleeve-Women-Satin-Pajamas-Sleepwear-Button-Down-Pjs-Set-Two-piece-Black-Large_1808bc82-711f-4b5b-a02b-2053891eca66.270208bc564149334b68a19ab8cd5a26.jpeg?odnBg=FFFFFF&odnHeight=1067&odnWidth=800', ARRAY['Đen', 'Hồng nhạt', 'Champagne']::text[]),
  ('bo-do-ngu-nu-satin-urban', 27, 'Bộ đồ ngủ nữ satin Urban', 'Bộ đồ ngủ nữ satin Urban. Ảnh minh họa màu xanh dương. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/seo/DAKIMOE-Sleepwear-Womens-Silky-Satin-Pajamas-Set-Long-Sleeve-Nightwear-Loungewear-Blue-M_eeb36fd2-1d4b-4aee-922b-36679648c1bc.c25080bdf53bcf58cf93d1ea9f3bf82f.jpeg', ARRAY['Xanh dương', 'Hồng nhạt', 'Đen']::text[]),
  ('bo-do-ngu-nu-satin-premium', 27, 'Bộ đồ ngủ nữ satin Premium', 'Bộ đồ ngủ nữ satin Premium. Ảnh minh họa màu champagne. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdn.faire.com/fastly/eb793672dcf2aeaca1290c3c7adf9c8bbca004105c41c94be14f89303129e9a2.jpeg?bg-color=FFFFFF&dpr=1&fit=crop&format=jpg&height=960&precrop=1798%2C2398%2Cx0%2Cy0%2Csafe&width=720', ARRAY['Champagne', 'Hồng nhạt', 'Đen']::text[]),
  ('ao-ni-unisex-trang-co-tron', 28, 'Áo nỉ unisex cổ tròn Basic', 'Áo nỉ unisex cổ tròn Basic. Ảnh minh họa màu trắng. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdnimg.webstaurantstore.com/images/products/large/832374/2816122.jpg', ARRAY['Trắng', 'Đen', 'Xám']::text[]),
  ('ao-ni-unisex-trang-co-tron-daily', 28, 'Áo nỉ unisex cổ tròn Daily', 'Áo nỉ unisex cổ tròn Daily. Ảnh minh họa màu nâu nhạt. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdnp.sanmar.com/medias/sys_master/images/h42/hde/17154883223582/1200W_57788_Latte-12-SXU004LatteFlatFront/1200W-57788-Latte-12-SXU004LatteFlatFront.jpg', ARRAY['Nâu nhạt', 'Trắng', 'Đen']::text[]),
  ('ao-ni-unisex-trang-co-tron-weekend', 28, 'Áo nỉ unisex cổ tròn Weekend', 'Áo nỉ unisex cổ tròn Weekend. Ảnh minh họa màu be. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://contents.mediadecathlon.com/m19774521/k%241ada0b7c0244fd48001cb99ed68c116b/picture.jpg', ARRAY['Be', 'Trắng', 'Đen']::text[]),
  ('ao-ni-unisex-trang-co-tron-urban', 28, 'Áo nỉ unisex cổ tròn Urban', 'Áo nỉ unisex cổ tròn Urban. Ảnh minh họa màu xanh olive. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://www.justlikehero.com/cdn/shop/files/OFF-1020-OL-01.png?v=1714443018&width=640', ARRAY['Xanh olive', 'Trắng', 'Đen']::text[]),
  ('ao-ni-unisex-trang-co-tron-premium', 28, 'Áo nỉ unisex cổ tròn Premium', 'Áo nỉ unisex cổ tròn Premium. Ảnh minh họa màu đỏ. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://trends-assets.trends.nz/Images/ProductImg/121132-8.jpg', ARRAY['Đỏ', 'Trắng', 'Đen']::text[]),
  ('ao-khoac-unisex-streetwear-basic', 29, 'Áo khoác unisex streetwear Basic', 'Áo khoác unisex streetwear Basic. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://i5.walmartimages.com/asr/92befca8-f320-408b-acc6-c04183b9ba7f.a85aebf8f025962d15a01973bebef147.jpeg?odnBg=FFFFFF&odnHeight=768&odnWidth=768', ARRAY['Đen', 'Xám', 'Xanh olive']::text[]),
  ('ao-khoac-unisex-streetwear-daily', 29, 'Áo khoác unisex streetwear Daily', 'Áo khoác unisex streetwear Daily. Ảnh minh họa màu đen xám. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://cdn.lunzo.cz/content/images/product/default/unisex-sportovni-bunda-na-zip-s-kontrastnimi-rukavy-a-elastickymi-lemy-lehka-prechodova-bunda-s-vysokym-limcem-volnocasovy-streetwear-styl-cerna-xxs_1059755.jpg', ARRAY['Đen xám', 'Đen', 'Xám']::text[]),
  ('ao-khoac-unisex-streetwear-weekend', 29, 'Áo khoác unisex streetwear Weekend', 'Áo khoác unisex streetwear Weekend. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://techwear-uk.com/cdn/shop/products/Techwear-UK-Black-Cargo-Pocket-Streetwear-Jacket-Front-Side-View_620x.png?v=1680848618', ARRAY['Đen', 'Xám', 'Xanh olive']::text[]),
  ('ao-khoac-unisex-streetwear-urban', 29, 'Áo khoác unisex streetwear Urban', 'Áo khoác unisex streetwear Urban. Ảnh minh họa màu xanh olive. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://techwear-uk.com/cdn/shop/products/Techwear-UK-Army-Green-Cargo-Jacket-Front-Side-View_1200x1200.png?v=1680938667', ARRAY['Xanh olive', 'Đen', 'Xám']::text[]),
  ('ao-khoac-unisex-streetwear-premium', 29, 'Áo khoác unisex streetwear Premium', 'Áo khoác unisex streetwear Premium. Ảnh minh họa màu đen. Có nhiều lựa chọn màu và size S, M, L, XL.', 'https://baseec-img-mng.akamaized.net/images/item/origin/1e88ee128c45c70abbe644e2dd74f8f1.jpg?imformat=generic', ARRAY['Đen', 'Xám', 'Xanh olive']::text[])
),
updated_products AS (
  UPDATE public.products p
  SET name = s.name,
      description = s.description,
      image_url = jsonb_build_array(s.image_url)
  FROM seed_product_images s
  WHERE p.slug = s.slug
    AND p.category_id = s.category_id
  RETURNING p.id, p.slug, p.category_id, p.base_price, p.image_url
),
inserted_variants AS (
  INSERT INTO public.product_variants (
    id, product_id, size, color, price, stock, sku, created_at
  )
  SELECT
    gen_random_uuid(),
    p.id,
    sizes.size,
    palette.color,
    p.base_price,
    20,
    'PRD-' || REPLACE(p.id::text, '-', '')
      || '-CLR-' || md5(palette.color)
      || '-' || sizes.size,
    CURRENT_TIMESTAMP
  FROM updated_products p
  JOIN seed_product_images s
    ON s.slug = p.slug AND s.category_id = p.category_id
  CROSS JOIN LATERAL unnest(s.colors) AS palette(color)
  CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS sizes(size)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.product_variants v
    WHERE v.product_id = p.id
      AND v.size = sizes.size
      AND v.color = palette.color
  )
  RETURNING id
)
SELECT
  (SELECT COUNT(*) FROM updated_products) AS updated_products,
  (SELECT COUNT(DISTINCT image_url ->> 0)
   FROM updated_products) AS unique_primary_images,
  (SELECT COUNT(*) FROM inserted_variants) AS added_variants,
  COALESCE((
    SELECT jsonb_agg(s.slug ORDER BY s.slug)
    FROM seed_product_images s
    WHERE NOT EXISTS (
      SELECT 1 FROM updated_products p
      WHERE p.slug = s.slug AND p.category_id = s.category_id
    )
  ), '[]'::jsonb) AS missing_product_slugs;
