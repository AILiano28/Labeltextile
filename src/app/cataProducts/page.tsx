import CataProductCard from '@/components/cataProduct/CataProductCard';
import FacebookCategoryTracker from '@/components/FacebookCategoryTracker';
import Features from '@/components/home/components/Features';
import { api } from '@/lib/api';

export default async function Page() {
  const products = await api.filterProducts({});
  
  return (
    <main>
      <FacebookCategoryTracker
        categoryName="All products"
        productIds={products.map((product) => product.id)}
      />
      <CataProductCard 
        cataName="جميع المنتجات" 
        products={products} 
      />
      <Features />
    </main>
  );
}
