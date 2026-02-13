// app/women/page.tsx
import { fetchProductWoman } from "@/app/api/productsAPI";
import WomenListProduct from "./ListWomen";
export default async function WomenPage() {
    const clothes = await fetchProductWoman();

    return (
        <div className="bg-[#F8F5EF]">
            <main className="container mx-auto px-4 py-12">
                <WomenListProduct clothes={clothes} />
            </main>
        </div>
    );
}
