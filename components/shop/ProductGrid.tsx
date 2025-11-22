import React from 'react';
import { View, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Database } from '@/types/supabase';

type ProductData = Database['public']['Tables']['shop_products']['Row'];

interface ProductGridProps {
  products: ProductData[];
  renderProduct: (product: ProductData, isFeatured: boolean) => React.ReactNode;
}

export function ProductGrid({ products, renderProduct }: ProductGridProps) {
  const { width } = useWindowDimensions();
  const isSmallWeb = width < 768;

  // Web Layout (Bento Grid)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webGrid}>
          {products.map((product, index) => {
            const isFeatured = product.featured;
            // Only apply span if not on small screen
            const span = (isFeatured && !isSmallWeb) ? 'span 2' : 'span 1';
            
            return (
              <View 
                key={product.id} 
                style={{ 
                  gridColumn: span,
                  gridRow: span,
                  height: '100%',
                  minHeight: isFeatured && !isSmallWeb ? 500 : 'auto',
                } as any}
              >
                {renderProduct(product, !!isFeatured)}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Mobile Layout (Masonry-like Flex)
  return (
    <View style={styles.mobileContainer}>
      {products.map((product, index) => {
        const isFeatured = product.featured;
        
        return (
          <View 
            key={product.id} 
            style={[
              styles.mobileItem,
              isFeatured ? styles.mobileFeaturedItem : styles.mobileRegularItem
            ]}
          >
            {renderProduct(product, !!isFeatured)}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  webGrid: {
    // @ts-ignore - React Native Web supports grid layout in styles
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gridAutoFlow: 'dense',
    gap: '24px',
    padding: 24,
    width: '100%',
    maxWidth: 1200,
  },
  mobileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  mobileItem: {
    marginBottom: 0,
  },
  mobileFeaturedItem: {
    width: '100%',
  },
  mobileRegularItem: {
    width: '47%', // Slightly less than 50% to account for gap
  },
});
