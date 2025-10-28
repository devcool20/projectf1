import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image, Pressable, Linking, Alert } from 'react-native';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

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

  const getTeamColors = (team: string | null) => {
    const teamColors: { [key: string]: string } = {
      'Red Bull Racing': 'from-blue-900 to-yellow-400',
      'Mercedes': 'from-cyan-400 to-gray-800',
      'Ferrari': 'from-red-600 to-yellow-400',
      'McLaren': 'from-orange-500 to-blue-600',
      'Aston Martin': 'from-green-600 to-pink-400',
      'Alpine': 'from-blue-500 to-pink-500',
      'Williams': 'from-blue-600 to-cyan-400',
      'Formula 1': 'from-red-600 to-gray-800',
    };
    
    return teamColors[team || ''] || 'from-gray-600 to-gray-800';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#181a20]">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ overflow: 'auto' }}
      >
        <View className="w-full max-w-md pb-24">
          {/* Header - more compact */}
          <View className="px-4 py-2">
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
              🛒 F1 Shop
            </Text>
            <Text style={{ color: '#b0b3b8', marginTop: 2, fontSize: 14, fontFamily: 'Formula1-Regular' }}>
              Get your F1 merchandise and team gear
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            {loading ? (
              <View className="bg-[#23272f] rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">⏳</Text>
                <Text style={{ fontSize: 20, fontWeight: '500', color: '#ffffff', fontFamily: 'Formula1-Regular' }}>
                  Loading products...
                </Text>
              </View>
            ) : products.length === 0 ? (
              <View className="bg-[#23272f] rounded-2xl p-8 items-center shadow-kodama-lg">
                <Text className="text-6xl mb-4">🛒</Text>
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#ffffff', marginBottom: 12, fontFamily: 'Formula1-Regular' }}>
                  No Products Available
                </Text>
                <Text style={{ color: '#b0b3b8', fontSize: 18, lineHeight: 28, textAlign: 'center', fontFamily: 'Formula1-Regular' }}>
                  Check back soon for F1 merchandise and team gear!
                </Text>
              </View>
            ) : (
              <ProductGrid 
                products={products}
                renderProduct={(product) => (
                  <View key={product.id} className="bg-[#23272f] rounded-2xl shadow-kodama-lg overflow-hidden">
                    {/* Image Placeholder with aspect ratio and contain mode */}
                    <View style={{ width: '100%', aspectRatio: 1, backgroundColor: '#181a20', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <Text className="text-2xl">🛍️</Text>
                        </View>
                      )}
                    </View>


                    {/* Featured Badge */}
                    {product.featured && (
                      <View className="absolute top-3 left-3 bg-yellow-500 px-2 py-1 rounded-full">
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600', fontFamily: 'Formula1-Regular' }}>⭐ FEATURED</Text>
                      </View>
                    )}

                    {/* Content */}
                    <View className="p-3">
                      {/* Product Name */}
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 4, fontFamily: 'Formula1-Regular' }} numberOfLines={2}>
                        {product.product_name}
                      </Text>

                      {/* Price and Category in one row */}
                      <View className="flex-row justify-between items-center mb-2">
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', fontFamily: 'Formula1-Regular' }}>
                          {formatPrice(product.price, product.currency)}
                        </Text>
                        {product.category && (
                          <Text style={{ fontSize: 12, color: '#b0b3b8', fontFamily: 'Formula1-Regular' }}>
                            {product.category}
                          </Text>
                        )}
                      </View>

                      {/* Buy Now Button */}
                      <Pressable
                        onPress={() => handleBuyNow(product.product_link)}
                        className="bg-[#dc2626] rounded-lg py-2 px-3 shadow-lg"
                      >
                        <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600', fontSize: 13, fontFamily: 'Formula1-Regular' }}>
                          Buy Now
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
