"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Product } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

function BestSellerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/4] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}

const BestSellers = ({ limit, excludeId }: { limit?: number, excludeId?: number }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const data = await api.filterProducts();
        const filteredData = excludeId
          ? data.filter(p => p.id !== excludeId)
          : data;
        setProducts(limit ? filteredData.slice(0, limit) : filteredData);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [limit, excludeId]);

  return (
    <section>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
              أفضل المبيعات
            </h2>
            <p className="text-[20px] font-medium text-black/70 leading-relaxed">
              اكتشفي أكثر التصاميم طلبًا والأكثر حبًا من عملائنا. مجموعة مختارة من القطع المميزة التي تجمع بين الأناقة، الراحة والتفاصيل الراقية، لتمنحكِ إطلالة استثنائية تناسب كل لحظة ومناسبة. ✨
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <BestSellerSkeleton key={i} />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-muted-foreground">No Products Found </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
