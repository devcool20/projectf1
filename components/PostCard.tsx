import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

interface PostCardProps {
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  onThreadClick?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const PostCard = ({ username, content, timestamp, likes, comments, onThreadClick, onLike, isLiked }: PostCardProps) => {
  return (
    <TouchableOpacity onPress={onThreadClick} className="bg-gradient-card rounded-2xl p-6 shadow-kodama-md border border-border/50 hover:shadow-kodama-lg transition-all duration-300 hover:scale-[1.02] group">
      {/* User Info */}
      <View className="flex flex-row items-center mb-2">
        <View className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold animate-pulse-glow mr-3">
          <Text className="text-white font-semibold text-lg">{username.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text className="font-heading font-semibold text-foreground">
            {username}
          </Text>
          <Text className="text-sm text-muted-foreground">{timestamp}</Text>
        </View>
      </View>
      {/* Content */}
      <Text className="text-foreground mb-4 leading-relaxed font-serif">
        {content}
      </Text>
      {/* Interaction Buttons - full width, equally spaced */}
      <View className="flex flex-row items-center justify-around pt-3 border-t border-border/30 -mx-6 px-6">
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className="flex flex-row items-center space-x-2 rounded-full text-muted-foreground hover:text-f1-red group/like"
        >
          <Heart 
            size={18} 
            className={`transition-all duration-300 group-hover/like:scale-125 ${isLiked ? "text-f1-red fill-f1-red" : "text-muted-foreground"}`} 
          />
          <Text className={`text-sm font-medium transition-colors duration-300 ${isLiked ? "text-f1-red" : "text-muted-foreground"}`}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={(e) => e.stopPropagation()}
          className="flex flex-row items-center space-x-2 rounded-full text-muted-foreground hover:text-accent group/comment"
        >
          <MessageCircle size={18} className="transition-transform duration-300 group-hover/comment:scale-125" />
          <Text className="text-sm font-medium">{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={(e) => e.stopPropagation()} 
          className="flex flex-row items-center space-x-2 rounded-full text-muted-foreground hover:text-primary group/share"
        >
          <Share2 size={18} className="transition-transform duration-300 group-hover/share:scale-125" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PostCard;
