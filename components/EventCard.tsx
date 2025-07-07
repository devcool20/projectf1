import { Image } from "react-native"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Button } from "./ui/button"

interface EventCardProps {
  title: string
  date: string
  location: string
  imageUrl: string
  onBook?: () => void
}

const EventCard = ({
  title,
  date,
  location,
  imageUrl,
  onBook,
}: EventCardProps) => {
  return (
    <Card className="overflow-hidden mb-6 rounded-2xl shadow-kodama-md border-border/50 bg-gradient-card">
      <Image source={{ uri: imageUrl }} className="w-full h-48" />
      <CardHeader>
        <CardTitle className="font-heading">{title}</CardTitle>
        <CardDescription className="pt-1">{date}</CardDescription>
        <CardDescription>{location}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="cta"
          size="lg"
          onPress={onBook}
          className="w-full shadow-kodama-sm hover:shadow-kodama-md transition-all duration-300"
        >
          Book Seat
        </Button>
      </CardContent>
    </Card>
  )
}

export default EventCard
