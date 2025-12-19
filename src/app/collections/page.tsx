import CollectionList from "./CollectionList";
import { fetchCollections } from "../api/collections";

export default async function CollectionsPage() {
  const LoadCollections = await fetchCollections()
  return (
    <CollectionList LoadCollections={LoadCollections} />
  );
}
