import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ProductCardProps {
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart?: () => void;
}

const ProductCard = ({ name, price, imageUrl, onAddToCart }: ProductCardProps) => {
  return (
    <View className="bg-gradient-card rounded-2xl shadow-kodama-md border border-border/50 overflow-hidden mb-6">
      <Image source={{ uri: imageUrl }} className="w-full h-64" />
      <View className="p-6">
        <Text className="font-heading text-xl text-foreground mb-2">{name}</Text>
        <Text className="font-serif text-2xl text-primary mb-6">${price}</Text>
        <TouchableOpacity 
          onPress={onAddToCart}
          className="bg-f1-red py-3 px-6 rounded-lg items-center shadow-kodama-sm hover:shadow-kodama-md transition-all duration-300"
        >
          <Text className="text-white font-semibold text-base">Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductCard;
