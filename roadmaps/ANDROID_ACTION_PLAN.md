# Android Community Screen - Immediate Action Plan

## Current Status
The Android version is missing several critical components that exist in the web version. The bundling error has been fixed, but significant work remains.

## Critical Missing Components

### 1. AnimatedThreadView.android.tsx
**File:** `components/community/AnimatedThreadView.android.tsx`
**Status:** DOES NOT EXIST
**Impact:** Users cannot view thread details, replies, or interact with individual threads
**Size:** ~1300 lines (from web version)
**Recommendation:** This is too large to create in one step. I recommend:
- Option A: Use the existing web version temporarily by importing it in community.android.tsx
- Option B: Create a simplified Android version with core features only
- Option C: Create it incrementally over multiple sessions

### 2. Enhanced ProfileModal
**File:** `components/ProfileModal.android.tsx`  
**Status:** EXISTS but missing features
**Missing Features:**
- Avatar upload
- Username editing
- Following tab
- Enhanced UI

### 3. BookmarkCard
**File:** `components/community/BookmarkCard.android.tsx`
**Status:** DOES NOT EXIST
**Impact:** Bookmarks view doesn't render properly

### 4. RepostCard
**File:** `components/RepostCard.android.tsx`
**Status:** DOES NOT EXIST  
**Impact:** Reposts don't display with proper styling

## Recommended Approach

### Quick Fix (Temporary)
Update `community.android.tsx` to import the web version of AnimatedThreadView:

```tsx
// Change this line:
import { AnimatedThreadView } from '@/components/community/AnimatedThreadView.tsx';

// Instead of trying to use a non-existent .android version
```

This will make the app functional immediately, though not perfectly optimized for Android.

### Proper Fix (Long-term)
Create Android-specific versions of all components, removing:
- Web-specific fonts ('Chirp', 'Inter' - use system fonts)
- Web-specific styling
- Optimize for mobile performance

## What I've Done So Far

1. ✅ Fixed news placeholder image error
2. ✅ Added News Ticker to Android feed
3. ✅ Updated PostCard.android to match web version
4. ✅ Added repost counts
5. ✅ Fixed modal prop names
6. ✅ Created detailed roadmaps

## What Needs to Be Done

### Immediate (to make app functional):
1. Import web AnimatedThreadView in community.android.tsx
2. Test on device/emulator
3. Fix any runtime errors

### Short-term (1-2 sessions):
1. Create simplified AnimatedThreadView.android.tsx
2. Update ProfileModal.android.tsx with avatar upload
3. Create BookmarkCard.android.tsx

### Long-term (3+ sessions):
1. Full feature parity with web
2. Android-specific optimizations
3. Performance tuning
4. Polish and animations

## Next Steps

**I recommend we:**
1. First, make a quick fix to use the web AnimatedThreadView
2. Test the app end-to-end
3. Then systematically create Android versions of each component

Would you like me to:
A) Make the quick fix now (use web AnimatedThreadView)
B) Start creating AnimatedThreadView.android.tsx (will take multiple iterations)
C) Focus on a different component first
