import { View, Text, ScrollView } from 'react-native';
import ProductCard from '@/components/ProductCard';

const products = [
  {
    id: 1,
    name: 'Red Bull Racing Cap',
    price: 39.99,
    image: 'https://castore.com/cdn/shop/products/60357195_grande.jpg?v=1676303194',
  },
  {
    id: 2,
    name: 'Ferrari Team Jacket',
    price: 129.99,
    image: 'https://images.footballfanatics.com/scuderia-ferrari/scuderia-ferrari-2024-team-softshell-jacket_ss5_p-201131533+u-h9cs3t4s7xpzga49lqnc+v-juymjg2jznjcen9t8gg8.jpg?_hv=2&w=600',
  },
];

export default function ShopScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 bg-background">
        <View className="p-6 bg-gradient-primary">
          <Text className="font-heading text-4xl text-primary-foreground mb-2">Official F1 Merchandise</Text>
          <Text className="font-serif text-lg text-primary-foreground/80">Show your support for your favorite team</Text>
        </View>

        <View className="p-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
