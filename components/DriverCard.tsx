import { View, Text, Image, TouchableOpacity } from 'react-native';

interface DriverCardProps {
  name: string;
  team: string;
  number: string;
  image: string;
  carImage: string;
  nationality: string;
  championships: number;
  races: number;
  podiums: number;
}

const DriverCard = ({ name, team, number, image, carImage, nationality, championships, races, podiums }: DriverCardProps) => {
  return (
    <View className="bg-gradient-card rounded-2xl shadow-kodama-md border border-border/50 overflow-hidden mb-6">
      <View className="flex-row h-48">
        <Image source={{ uri: image }} className="w-1/2 h-full" resizeMode="cover" />
        <Image source={{ uri: carImage }} className="w-1/2 h-full bg-muted/30" resizeMode="contain" />
      </View>
      <View className="p-6">
        <View className="absolute -top-5 right-6 bg-f1-red w-12 h-12 rounded-full justify-center items-center border-4 border-background">
          <Text className="text-white text-2xl font-heading">{number}</Text>
        </View>
        <Text className="font-heading text-3xl text-foreground mb-1">{name}</Text>
        <Text className="font-serif text-lg text-muted-foreground mb-4">{team}</Text>
        
        <View className="flex-row justify-between border-t border-border/30 pt-4">
          <View className="items-center">
            <Text className="font-heading text-2xl text-primary">{championships}</Text>
            <Text className="font-serif text-sm text-muted-foreground">Championships</Text>
          </View>
          <View className="items-center">
            <Text className="font-heading text-2xl text-primary">{races}</Text>
            <Text className="font-serif text-sm text-muted-foreground">Races</Text>
          </View>
          <View className="items-center">
            <Text className="font-heading text-2xl text-primary">{podiums}</Text>
            <Text className="font-serif text-sm text-muted-foreground">Podiums</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DriverCard;
