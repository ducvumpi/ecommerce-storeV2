import { fetchClothesByProduct } from "@/app/api/productsAPI";
import ProductCard from "@/app/components/ui/product/product-card";
import ProductGallery from "@/app/components/ui/product/product-gallery";



export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const collection = await fetchClothesByProduct(params.slug);

    if (!collection) {
        return <h1>Không tìm thấy sản phẩm</h1>;
    }

    return (
        <div className="grid pb-16 px-16 pt-10 bg-background min-h-screen gap-12"
            style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
            <ProductGallery collection={collection} />
            <ProductCard product={collection} />
        </div>
    );
}
