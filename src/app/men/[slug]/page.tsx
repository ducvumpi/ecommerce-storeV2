import { fetchClothesByProduct } from "@/app/api/productsAPI";
import ProductCard from "@/app/components/ui/product/product-card";
import ProductGallery from "@/app/components/ui/product/product-gallery";



export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const collection = await fetchClothesByProduct(params.slug);

    if (!collection) {
        return <h1>Không tìm thấy sản phẩm</h1>;
    }

    return (
        <div className="flex pb-16 px-8 bg-background min-h-screen gap-10">

            {/* LEFT: GALLERY */}
            <ProductGallery collection={collection} />

            {/* RIGHT: INFO */}
            <ProductCard product={collection} />
        </div>
    );
}
