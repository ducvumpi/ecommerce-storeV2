import { fetchClothesByProductWoman } from "@/app/api/productsAPI";
import ProductCard from "@/app/components/ui/product/product-card";
import ProductGallery from "@/app/components/ui/product/product-gallery";



export default async function ProductDetailWoman({ params }: { params: { slug: string } }) {
  const collection = await fetchClothesByProductWoman(params.slug);

  if (!collection) {
    return <h1>Không tìm thấy sản phẩm</h1>;
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] pb-16 px-4 sm:px-8 lg:px-16 pt-10 bg-background min-h-screen gap-6 sm:gap-8 lg:gap-12">
      <ProductGallery collection={collection} />
      <ProductCard product={collection} />
    </div>
  );
}
