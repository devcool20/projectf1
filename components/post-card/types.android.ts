export interface PostCardProps {
  username: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  favoriteTeam?: string;
  userId: string;
  userEmail?: string;
  onCommentPress: () => void;
  onLikePress: () => void;
  onBookmarkPress?: () => void;
  onRepostPress?: () => void;
  onDeletePress?: () => void;
  onProfilePress?: (userId: string) => void;
  canDelete?: boolean;
  isAdmin?: boolean;
  canAdminDelete?: boolean;
  threadType?: 'thread' | 'repost';
} 