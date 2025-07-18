export interface PostCardProps {
  username: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  views?: number;
  isLiked: boolean;
  canDelete: boolean;
  favoriteTeam?: string;
  userId?: string; // Add userId for profile modal
  userEmail?: string; // Add userEmail for admin check
  isAdmin?: boolean; // Add isAdmin prop
  canAdminDelete?: boolean; // Add admin delete capability
  onLikePress: () => void;
  onCommentPress: () => void;
  onDeletePress: () => void;
  onProfilePress?: (userId: string) => void; // Add profile press handler
} 