import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image, Pressable, Linking, Alert, Dimensions, Platform } from 'react-native';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { HoverableCard } from '@/components/shop/HoverableCard';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

type ProductData = Database['public']['Tables']['shop_products']['Row'];

export default function ShopScreen() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true })
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleBuyNow = async (productLink: string) => {
    try {
      const supported = await Linking.canOpenURL(productLink);
      
      if (supported) {
        await Linking.openURL(productLink);
      } else {
        Alert.alert(
          'Unable to open link',
          'Sorry, we couldn\'t open this product link.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening product link:', error);
      Alert.alert(
        'Error',
        'An error occurred while trying to open the product link.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return 'Price available on site';
    
    const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#181a20]">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
        }
        style={{ overflow: 'auto' }}
      >
        <View className="w-full pb-24">
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.duration(800).springify()}
            className="px-6 py-10 items-center w-full"
          >
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.2)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
            />
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#ffffff', fontFamily: 'Formula1-Regular', marginBottom: 8, textAlign: 'center' }}>
              F1 Shop
            </Text>
            <Text style={{ color: '#b0b3b8', fontSize: 16, fontFamily: 'Formula1-Regular', textAlign: 'center', maxWidth: 600, lineHeight: 24 }}>
              Official merchandise, team gear, and exclusive collections for the ultimate F1 fan.
            </Text>
          </Animated.View>

          {/* Content */}
          <View className="w-full items-center">
            {loading ? (
              <View className="h-96 items-center justify-center">
                <Text style={{ fontSize: 16, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
                  Loading products...
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View className="bg-[#23272f] rounded-2xl p-8 items-center max-w-md mx-4">
                <Text className="text-6xl mb-4">🛒</Text>
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', marginBottom: 12, fontFamily: 'Formula1-Regular' }}>
                  No Products Available
                </Text>
                <Text style={{ color: '#b0b3b8', fontSize: 16, textAlign: 'center', fontFamily: 'Formula1-Regular' }}>
                  Check back soon for new arrivals!
                </Text>
              </View>
            ) : (
              <ProductGrid 
                products={products}
                renderProduct={(product, isFeatured) => (
                  <HoverableCard 
                    key={product.id} 
                    onPress={() => handleBuyNow(product.product_link)}
                    style={{
                      backgroundColor: '#23272f',
                      borderRadius: 16,
                      overflow: 'hidden',
                      height: '100%',
                      borderWidth: 1,
                      borderColor: '#333',
                      position: 'relative',
                    }}
                  >
                    {/* Image Container */}
                    <View style={{ 
                      width: '100%', 
                      aspectRatio: isFeatured ? 1.2 : 1, 
                      backgroundColor: '#1e2128', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                       {/* Featured Gradient Overlay */}
                       {isFeatured && (
                         <LinearGradient
                           colors={['rgba(220, 38, 38, 0.1)', 'transparent']}
                           style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
                         />
                       )}
                       
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          style={{ width: '85%', height: '85%' }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text className="text-4xl">🛍️</Text>
                      )}

                      {/* Featured Badge */}
                      {isFeatured && (
                        <View className="absolute top-3 right-3 bg-[#dc2626] px-2 py-1 rounded md:px-3 md:py-1" style={{ zIndex: 10 }}>
                          <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700', fontFamily: 'Formula1-Regular', letterSpacing: 1 }}>
                            FEATURED
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View className="p-4 flex-1 justify-between">
                      <View>
                        {product.category && (
                          <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: '600', marginBottom: 4, fontFamily: 'Formula1-Regular', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {product.category}
                          </Text>
                        )}
                        <Text style={{ 
                          fontSize: isFeatured ? 18 : 15, 
                          fontWeight: '600', 
                          color: '#ffffff', 
                          marginBottom: 8, 
                          fontFamily: 'Formula1-Regular',
                          lineHeight: isFeatured ? 24 : 20
                        }} numberOfLines={2}>
                          {product.product_name}
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-[#333]">
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
                          {formatPrice(product.price, product.currency)}
                        </Text>
                        
                        <View className="bg-[#ffffff] rounded-full px-3 py-1.5">
                          <Text style={{ color: '#000000', fontWeight: '700', fontSize: 11, fontFamily: 'Formula1-Regular' }}>
                            BUY NOW
                          </Text>
                        </View>
                      </View>
                    </View>
                  </HoverableCard>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
