# Web Migration Roadmap (Next.js)

This roadmap outlines the steps to migrate the web portion of the F1 Community App from Expo Web to a dedicated, high-performance **Next.js** application. This ensures strict separation from mobile code and allows for maximum optimization.

## Phase 1: Foundation & Setup
- [ ] **Initialize Next.js Project**
  - Create a new directory `web-platform` (or similar) within the project root.
  - Run `npx create-next-app@latest` with TypeScript, Tailwind CSS, and ESLint.
  - Configure `next.config.js` for image domains (Supabase).
- [ ] **Environment Setup**
  - Copy `.env` variables from the main project (Supabase URL/Key).
  - Install dependencies: `@supabase/supabase-js`, `lucide-react`, `date-fns`.
  - Setup ShadcnUI or generic Tailwind components for rapid UI development.

## Phase 2: Core Logic & Services Migration
- [ ] **Supabase Integration**
  - Replicate `lib/supabase.ts` logic in the new web project.
  - Ensure authentication flow works (Cookie-based auth is better for Next.js SSR, but client-side is fine for specific SPAs).
  - **Shared Types**: Copy strict TypeScript interfaces for `Thread`, `Profile`, `Repost` to a shared types file.
- [ ] **State Management**
  - Port `contexts/AuthContext.tsx` to a Next.js Context Provider.
  - Port `hooks/` (e.g., specific logic for fetching threads) to React Query or SWR for better caching and speed.

## Phase 3: UI/UX Reconstruction (The "Perfect" Build)
- [ ] **Component Migration (RN -> DOM)**
  - Convert `View` -> `div`/`section`.
  - Convert `Text` -> `p`/`span`/`h1`.
  - Convert `Image` -> `next/image` (Crucial for performance).
  - Convert `TouchableOpacity` -> `button` or `Link`.
- [ ] **Layout Implementation**
  - Create `app/layout.tsx` for global providers and global styles.
  - Implement the Sidebar navigation (convert from `app/_layout.tsx` logic).
  - Implement the Right-side "Active Communities" or News column (if applicable).
- [ ] **Feature Implementation**
  - **Feed**: Implement the Main Feed using optimized list rendering (no `FlatList` needed, just standard mapping with pagination).
  - **Thread View**: Create dynamic routes `app/thread/[id]/page.tsx`.
  - **Media**: Optimize image uploading and rendering logic.

## Phase 4: Polish & Performance "Fast"
- [ ] **Routing & SEO**
  - Use Next.js App Router for deep linking capability.
  - Add Metadata generation for Threads (Open Graph images).
- [ ] **Optimization**
  - Implement lazy loading for images and heavy components.
  - Server Side Rendering (SSR) for the initial feed fetch to ensure "Speed".

## Phase 5: Safety & Switchover
- [ ] **Validation**
  - Verify feature parity with the old web build.
  - Test responsiveness on Desktop, Tablet, and Mobile Web.
- [ ] **Deployment**
  - Deploy to Vercel for fast global CDN serving.

---

**Status**: Planning
**Target Framework**: Next.js 15 (App Router)
