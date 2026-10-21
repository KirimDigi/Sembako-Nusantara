import React from 'react';
import { ProductCatalogSection } from '../components/catalog/ProductCatalogSection';

export const CatalogPage: React.FC = () => {
  return (
    <div className="w-full pb-16">
      <ProductCatalogSection showTitleHeader={false} showCategoryBar={true} />
    </div>
  );
};
