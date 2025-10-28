import React from 'react';
import { View, Platform } from 'react-native';
import { Database } from '@/types/supabase';

type ProductData = Database['public']['Tables']['shop_products']['Row'];

interface ProductGridProps {
  products: ProductData[];
  renderProduct: (product: ProductData) => React.ReactNode;
}

export function ProductGrid({ products, renderProduct }: ProductGridProps) {
  // Only apply grid layout on web
  if (Platform.OS === 'web') {
    return (
      <View style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        padding: '16px 24px',
      }}>
        {products.slice(0, 9).map((product) => (
          <View key={product.id} style={{ width: '100%' }}>
            {renderProduct(product)}
          </View>
        ))}
      </View>
    );
  }

  // Return regular vertical layout for mobile
  return (
    <View className="space-y-4">
      {products.map(renderProduct)}
    </View>
  );
}
