import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, Image, Pressable, Linking, Alert } from 'react-native';
import AnimatedRadioCards from '@/components/AnimatedRadioCards';
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 bg-gradient-to-br from-background to-secondary/20 h-screen w-screen overflow-hidden">
        {/* Animated Radio Cards */}
        <AnimatedRadioCards />

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="w-full max-w-md pb-24">
            {/* Header */}
            <View className="bg-gradient-card p-6 shadow-kodama-lg">
              <Text className="text-2xl font-heading font-bold text-foreground">
                🛒 F1 Shop
              </Text>
              <Text className="text-muted-foreground mt-1">
                Get your F1 merchandise and team gear
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              {loading ? (
                <View className="bg-gradient-card rounded-2xl p-8 items-center shadow-kodama-lg">
                  <Text className="text-6xl mb-4">⏳</Text>
                  <Text className="text-xl font-medium text-foreground">
                    Loading products...
                  </Text>
                </View>
              ) : products.length === 0 ? (
                <View className="bg-gradient-card rounded-2xl p-8 items-center shadow-kodama-lg">
                  <Text className="text-6xl mb-4">🛒</Text>
                  <Text className="text-2xl font-heading font-bold text-foreground mb-3">
                    No Products Available
                  </Text>
                  <Text className="text-muted-foreground text-lg leading-relaxed text-center">
                    Check back soon for F1 merchandise and team gear!
                  </Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {products.map((product) => (
                    <View key={product.id} className="bg-gradient-card rounded-2xl shadow-kodama-lg overflow-hidden">
                      {/* Header Image */}
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          className="w-full h-48"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Text className="text-4xl">🛍️</Text>
                        </View>
                      )}

                      {/* Team Badge */}
                      {product.team && (
                        <View 
                          className={`absolute top-3 right-3 bg-gradient-to-r ${getTeamColors(product.team)} px-2 py-1 rounded-full`}
                        >
                          <Text className="text-white text-xs font-medium">
                            {product.team}
                          </Text>
                        </View>
                      )}

                      {/* Featured Badge */}
                      {product.featured && (
                        <View className="absolute top-3 left-3 bg-yellow-500 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-bold">⭐ FEATURED</Text>
                        </View>
                      )}

                      {/* Content */}
                      <View className="p-4">
                        {/* Product Name */}
                        <Text className="text-xl font-heading font-bold text-foreground mb-2">
                          {product.product_name}
                        </Text>

                        {/* Price */}
                        <View className="mb-3">
                          <Text className="text-lg font-bold text-primary">
                            {formatPrice(product.price, product.currency)}
                          </Text>
                          {product.category && (
                            <Text className="text-sm text-muted-foreground mt-1">
                              {product.category}
                            </Text>
                          )}
                        </View>

                        {/* Description */}
                        {product.description && (
                          <Text className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {product.description}
                          </Text>
                        )}

                        {/* Buy Now Button */}
                        <Pressable
                          onPress={() => handleBuyNow(product.product_link)}
                          className="bg-primary rounded-xl py-3 px-4 shadow-lg"
                        >
                          <View className="flex-row items-center justify-center">
                            <Text className="text-white text-base font-semibold mr-2">
                              Buy Now
                            </Text>
                            <Text className="text-white text-base">🛒</Text>
                          </View>
                        </Pressable>

                        {/* Availability Status */}
                        {product.is_available === false && (
                          <View className="mt-3 pt-3 border-t border-border">
                            <Text className="text-xs text-muted-foreground text-center">
                              Currently out of stock
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
