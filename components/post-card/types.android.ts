export interface PostCardProps {
  username: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  canDelete: boolean;
  favoriteTeam?: string;
  onLikePress: () => void;
  onCommentPress: () => void;
  onDeletePress: () => void;
} 