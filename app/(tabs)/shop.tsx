import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Official F1 Merchandise</Text>
        <Text style={styles.headerSubtitle}>Show your support for your favorite team</Text>
      </View>

      <View style={styles.content}>
        {products.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard}>
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              <TouchableOpacity style={styles.addToCartButton}>
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'RacingSansOne',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#E10600',
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: '#E10600',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});