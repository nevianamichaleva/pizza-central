import MenuCatalog from '@/components/MenuCatalog';
import { getRestaurantMenuCatalog } from '@/lib/restaurantMenuCatalog';
import CentralMenuPage from '../[lang]/central-menu/page';

export const revalidate = 300;

export default async function CentralMenuRootPage() {
  const categories = await getRestaurantMenuCatalog();

  return (
    <>
      <CentralMenuPage />
      <MenuCatalog categories={categories} />
    </>
  );
}
