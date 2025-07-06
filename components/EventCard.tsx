import { View, Text, Image, TouchableOpacity } from 'react-native';

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  onBook?: () => void;
}

const EventCard = ({ title, date, location, imageUrl, onBook }: EventCardProps) => {
  return (
    <View className="bg-gradient-card rounded-2xl shadow-kodama-md border border-border/50 overflow-hidden mb-6">
      <Image source={{ uri: imageUrl }} className="w-full h-48" />
      <View className="p-6">
        <Text className="font-heading text-2xl text-foreground mb-2">{title}</Text>
        <Text className="font-serif text-base text-muted-foreground mb-1">{date}</Text>
        <Text className="font-serif text-base text-muted-foreground mb-6">{location}</Text>
        <TouchableOpacity 
          onPress={onBook}
          className="bg-f1-red py-3 px-6 rounded-lg items-center shadow-kodama-sm hover:shadow-kodama-md transition-all duration-300"
        >
          <Text className="text-white font-semibold text-base">Book Seat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;
