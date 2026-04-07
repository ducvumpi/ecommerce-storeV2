// app/men/page.tsx
import { fetchProduct } from "@/app/api/productsAPI";
import MenList from "../components/ui/men/ListMen";

export default async function MenPage() {
  const clothes = await fetchProduct();

  return (
    <div className="bg-[#F8F5EF]">
      <main className="container mx-auto px-4 py-12">
        <MenList clothes={clothes} />
      </main>
    </div>
  );
}
