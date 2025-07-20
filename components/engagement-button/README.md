# EngagementButton Component

A reusable, animated engagement button component for React Native applications that provides smooth animations and haptic feedback for like, repost, and bookmark interactions.

## Features

- **Smooth Animations**: Uses React Native Reanimated for 60fps animations
- **Haptic Feedback**: Provides tactile feedback on button press
- **Multiple Types**: Supports like, repost, and bookmark interactions
- **Customizable**: Configurable colors, sizes, and accessibility labels
- **TypeScript Support**: Fully typed with proper interfaces

## Usage

```tsx
import EngagementButton from '@/components/engagement-button';
import { Heart, Repeat2, Bookmark } from 'lucide-react-native';

// Like button
<EngagementButton
  icon={Heart}
  active={isLiked}
  onPress={handleLike}
  type="like"
  size={14}
  accessibilityLabel="Like post"
/>

// Repost button
<EngagementButton
  icon={Repeat2}
  active={isReposted}
  onPress={handleRepost}
  type="repost"
  size={14}
  accessibilityLabel="Repost"
/>

// Bookmark button
<EngagementButton
  icon={Bookmark}
  active={isBookmarked}
  onPress={handleBookmark}
  type="bookmark"
  size={14}
  accessibilityLabel="Bookmark post"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `ComponentType<any>` | Yes | - | The icon component to display |
| `active` | `boolean` | Yes | - | Whether the button is in active state |
| `onPress` | `() => void` | Yes | - | Function called when button is pressed |
| `type` | `'like' \| 'repost' \| 'bookmark'` | Yes | - | The type of engagement button |
| `size` | `number` | No | `24` | Size of the icon |
| `activeColor` | `string` | No | Auto | Custom active color |
| `inactiveColor` | `string` | No | `#6b7280` | Custom inactive color |
| `accessibilityLabel` | `string` | No | - | Accessibility label for screen readers |

## Animation Types

### Like Button
- **Active**: Scales up to 1.2x, springs back to 1x, fills with red color
- **Inactive**: Scales down to 0.95x, springs back to 1x, color fades out

### Repost Button
- **Active**: 360° rotation with color change to green
- **Web Enhanced**: Additional scale up to 1.2x during rotation
- **Inactive**: Smooth color transition

### Bookmark Button
- **Active**: Scales up to 1.15x, springs back to 1x, fills with yellow color
- **Web Enhanced**: Additional subtle bounce effect (translateY animation)
- **Inactive**: Scales down to 0.95x, springs back to 1x, color fades out

## Platform-Specific Features

### Web Platform
- **Enhanced Repost**: Scale animation during rotation for more visual impact
- **Enhanced Bookmark**: Bounce effect with translateY for playful interaction
- **No Haptic Feedback**: Gracefully skips haptic feedback (not supported on web)

### Native Platforms (iOS/Android)
- **Haptic Feedback**: Light impact feedback on all button presses
- **Standard Animations**: Core animations without web-specific enhancements

## Dependencies

- `react-native-reanimated`: For smooth animations
- `expo-haptics`: For haptic feedback
- `lucide-react-native`: For icons (or any icon library)

## Implementation Notes

- All animations run on the UI thread for optimal performance
- Haptic feedback is provided on every press for better user experience
- Colors are interpolated smoothly between active and inactive states
- The component follows React Native best practices for accessibility 