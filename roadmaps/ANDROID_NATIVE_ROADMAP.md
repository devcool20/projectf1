# Android Native Roadmap (React Native/Expo)

This roadmap focuses on refactoring the existing React Native codebase to be "Mobile First," specifically targeting Android improvements while removing web-specific overhead.

## Phase 1: Cleanup & Separation
- [ ] **Audit Existing Code**
  - Identify components in `components/` that are heavily web-optimized or contain `Platform.OS === 'web'` logic.
  - Create native-specific versions of complex components (e.g., `ThreadView.android.tsx` if needed).
- [ ] **File Structuring**
  - Ensure `app/(tabs)/community.android.tsx` becomes the primary source of truth for the Android feed.
  - Remove "Web Only" libraries if they are unused in the native build (e.g., web-specific analytics or DOM tools).

## Phase 2: Android UI/UX Refinement
- [ ] **Layout Optimizations**
  - Fix `SafeAreaView` issues on Android (Notch/Status Bar overlap).
  - Ensure `StatusBar` contrast is correct (Light/Dark mode).
  - **Navigation**: Verify `Expo Router` stack transitions feel native (slide animations).
- [ ] **Performance Tuning**
  - **FlatList Optimization**: Ensure `initialNumToRender`, `windowSize`, and `removeClippedSubviews` are tuned for Android memory usage.
  - **Image Caching**: Use `expo-image` instead of standard `Image` for better caching and performance on Android.
  - **Animation**: Ensure Reanimated 3 works smoothly (60fps) on mid-range Android devices.

## Phase 3: Android Specific Features
- [ ] **Native Inputs**
  - Improve `TextInput` behavior (Keyboard handling, `KeyboardAvoidingView`).
  - Fix "swallow touches" issues often found in Android ScrollViews.
- [ ] **Device Integration**
  - Test Camera and Gallery permissions flow on Android 14+.
  - Implement native "Share" sheet functionality.

## Phase 4: Build & Release
- [ ] **APK Building**
  - Configure `eas.json` for optimized internal Android distribution.
  - Generate a signed APK/AAB for testing.
- [ ] **Testing**
  - Test on real Android devices (not just emulators).
  - Validate "Back" button behavior (Hardware back button handling).

---

**Status**: Planning
**Target Platform**: Android (primary), iOS (secondary)
