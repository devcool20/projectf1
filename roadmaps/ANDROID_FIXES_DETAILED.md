# Android Community Screen - Complete Fix Plan

## Overview
This document outlines all the components that need to be updated to achieve pixel-perfect parity between Android and Web versions.

## Components to Fix

### 1. **AnimatedThreadView.android.tsx** (CRITICAL - MISSING)
**Status:** Does not exist
**Action:** Create from web version `components/community/AnimatedThreadView.tsx`
**Features to implement:**
- Slide-in animation from right
- Full thread detail view with replies
- Reply posting with image support
- Like/Bookmark/Repost functionality
- Repost handling (both viewing and replying)
- Delete functionality for own replies
- Profile navigation
- Image preview modal

### 2. **ProfileModal.android.tsx** (NEEDS UPDATE)
**Status:** Exists but missing features
**Current Issues:**
- No avatar upload functionality
- No username editing
- No "Following" tab
- Missing delete profile confirmation
**Action:** Port features from `components/ProfileModal.tsx`:
- Avatar upload with image compression
- Username editing with real-time availability check
- Following/Followers tab
- Enhanced delete confirmation modal

### 3. **BookmarkCard Component** (MISSING)
**Status:** Does not exist for Android
**Action:** Create `components/community/BookmarkCard.android.tsx`
**Features:**
- Display bookmarked threads
- Show original thread for reposts
- Engagement buttons
- Remove bookmark functionality

### 4. **RepostCard Component** (NEEDS ANDROID VERSION)
**Status:** Web version exists, Android version needed
**Action:** Create `components/RepostCard.android.tsx` from `components/RepostCard.tsx`
**Features:**
- Display repost with original thread preview
- Show reposter's comment
- Engagement metrics for both repost and original
- Proper styling to match web

### 5. **community.android.tsx Main Screen**
**Current Issues:**
- Missing proper bookmark view rendering
- AnimatedThreadView not properly integrated
- Profile modal missing features
- Search functionality incomplete

## Implementation Priority

### Phase 1: Critical Components (Do First)
1. Create `AnimatedThreadView.android.tsx` - This is the most important missing piece
2. Update `ProfileModal.android.tsx` with all web features
3. Create `BookmarkCard.android.tsx`

### Phase 2: Enhanced Features
4. Create `RepostCard.android.tsx`
5. Fix community.android.tsx integration
6. Add proper error handling and loading states

### Phase 3: Polish
7. Add animations and transitions
8. Optimize performance
9. Test all user flows

## Key Differences to Handle

### Android-Specific Considerations:
1. **No Web Fonts:** Remove `fontFamily: 'Chirp'` references, use system fonts
2. **Image Handling:** Use `expo-image` for better caching
3. **Animations:** Use `react-native-reanimated` v3 syntax
4. **Modals:** Use React Native `Modal` component instead of web modals
5. **Safe Areas:** Proper `SafeAreaView` usage for Android notches

### Files to Create:
- `components/community/AnimatedThreadView.android.tsx`
- `components/community/BookmarkCard.android.tsx`
- `components/RepostCard.android.tsx`

### Files to Update:
- `components/ProfileModal.android.tsx`
- `app/(tabs)/community.android.tsx`

## Next Steps
1. Start with AnimatedThreadView.android.tsx (highest priority)
2. Test on actual Android device
3. Iterate based on visual comparison with web version
