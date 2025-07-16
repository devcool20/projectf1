export interface Profile {
  id: string;
  username?: string;
  displayName?: string;
  display_name?: string;
  avatar_url?: string;
  favorite_team?: string;
  is_admin?: boolean;
}

export interface Thread {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles?: Profile | null;
  likeCount?: number;
  replyCount?: number;
  isLiked?: boolean;
}

export interface Reply {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  thread_id: string;
  profiles?: Profile | null;
  likeCount?: number;
  isLiked?: boolean;
}

export interface Session {
  user: {
    id: string;
    email?: string;
  };
}

export interface ThreadViewProps {
  thread: Thread | null;
  onClose: () => void;
  session: Session | null;
}
