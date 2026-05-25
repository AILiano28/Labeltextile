import CataProductCard from '@/components/cataProduct/CataProductCard';
import FacebookCategoryTracker from '@/components/FacebookCategoryTracker';
import Features from '@/components/home/components/Features';
import { api } from '@/lib/api';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; name: string }>;
}) {
  const { id, name } = await params;
  const cataId = parseInt(id);
  const cataName = decodeURIComponent(name);

  // Fetch products on server
  const products = await api.filterProducts({ cataId });

  return (
    <main>
      <FacebookCategoryTracker
        categoryId={cataId}
        categoryName={cataName}
        productIds={products.map((product) => product.id)}
      />
      <CataProductCard 
        cataName={cataName} 
        products={products} 
      />
      <Features />
    </main>
  );
}
