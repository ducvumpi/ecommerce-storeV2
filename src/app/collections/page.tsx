import CollectionList from "../components/ui/collections/CollectionList";
import { fetchCollections } from "../api/collections";

export default async function CollectionsPage() {
  const LoadCollections = await fetchCollections()
  return (
    <div className="bg-[#F8F5EF]">
      <CollectionList LoadCollections={LoadCollections} />

    </div>
  );
}
