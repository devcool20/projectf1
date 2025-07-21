import { create } from 'zustand';

interface EngagementState {
  likes: Record<string, boolean>; // threadId/repostId -> liked
  bookmarks: Record<string, boolean>; // threadId/repostId -> bookmarked
  replyCounts: Record<string, number>; // threadId/repostId -> reply count
  setLike: (id: string, liked: boolean) => void;
  setBookmark: (id: string, bookmarked: boolean) => void;
  setReplyCount: (id: string, count: number) => void;
  bulkSet: (data: { likes?: Record<string, boolean>; bookmarks?: Record<string, boolean>; replyCounts?: Record<string, number> }) => void;
}

export const useEngagementStore = create<EngagementState>((set) => ({
  likes: {},
  bookmarks: {},
  replyCounts: {},
  setLike: (id, liked) => set((state) => ({ likes: { ...state.likes, [id]: liked } })),
  setBookmark: (id, bookmarked) => set((state) => ({ bookmarks: { ...state.bookmarks, [id]: bookmarked } })),
  setReplyCount: (id, count) => set((state) => ({ replyCounts: { ...state.replyCounts, [id]: count } })),
  bulkSet: (data) => set((state) => ({
    likes: data.likes ? { ...state.likes, ...data.likes } : state.likes,
    bookmarks: data.bookmarks ? { ...state.bookmarks, ...data.bookmarks } : state.bookmarks,
    replyCounts: data.replyCounts ? { ...state.replyCounts, ...data.replyCounts } : state.replyCounts,
  })),
})); 