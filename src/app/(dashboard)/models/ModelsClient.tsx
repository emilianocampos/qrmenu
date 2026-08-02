'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Product, Business } from '@/types';
import { Product3DCard } from '@/components/models/Product3DCard';
import { delete3DModel, getProductsWithModels } from '@/actions/models';

interface ModelsClientProps {
  initialProducts: Product[];
  business: Business;
}

export function ModelsClient({ initialProducts, business }: ModelsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const handleRefresh = async () => {
    try {
      const res = await getProductsWithModels(business.id);
      if (res.data) {
        setProducts(res.data as Product[]);
      }
    } catch (error) {
      console.error('Error al actualizar productos:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    const result = await delete3DModel(productId);
    if (result.error) throw new Error(result.error);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Modelos 3D"
          description="Genera modelos 3D a partir de las imágenes de tus productos utilizando Inteligencia Artificial."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/10">
              No tienes productos creados. Ve a Productos para añadir algunos.
            </div>
          ) : (
            products.map(product => (
              <Product3DCard
                key={product.id}
                initialProduct={product}
                onDelete={handleDelete}
                onRefresh={handleRefresh}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
