import { create } from 'zustand';

interface EngagementState {
  likes: Record<string, boolean>; // threadId/repostId -> liked
  bookmarks: Record<string, boolean>; // threadId/repostId -> bookmarked
  replyCounts: Record<string, number>; // threadId/repostId -> reply count
  replyLikes: Record<string, boolean>; // replyId -> liked
  setLike: (id: string, liked: boolean) => void;
  setBookmark: (id: string, bookmarked: boolean) => void;
  setReplyCount: (id: string, count: number) => void;
  setReplyLike: (replyId: string, liked: boolean) => void;
  bulkSet: (data: { likes?: Record<string, boolean>; bookmarks?: Record<string, boolean>; replyCounts?: Record<string, number>; replyLikes?: Record<string, boolean> }) => void;
}

export const useEngagementStore = create<EngagementState>((set) => ({
  likes: {},
  bookmarks: {},
  replyCounts: {},
  replyLikes: {},
  setLike: (id, liked) => set((state) => ({ likes: { ...state.likes, [id]: liked } })),
  setBookmark: (id, bookmarked) => set((state) => ({ bookmarks: { ...state.bookmarks, [id]: bookmarked } })),
  setReplyCount: (id, count) => set((state) => ({ replyCounts: { ...state.replyCounts, [id]: count } })),
  setReplyLike: (replyId, liked) => set((state) => ({ replyLikes: { ...state.replyLikes, [replyId]: liked } })),
  bulkSet: (data) => set((state) => ({
    likes: data.likes ? { ...state.likes, ...data.likes } : state.likes,
    bookmarks: data.bookmarks ? { ...state.bookmarks, ...data.bookmarks } : state.bookmarks,
    replyCounts: data.replyCounts ? { ...state.replyCounts, ...data.replyCounts } : state.replyCounts,
    replyLikes: data.replyLikes ? { ...state.replyLikes, ...data.replyLikes } : state.replyLikes,
  })),
})); 