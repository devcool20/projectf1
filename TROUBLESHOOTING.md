# Troubleshooting Guide

## Current Issues and Solutions

### 1. ✅ Database Issues Resolved

**Problem**: The app was trying to access a `news_articles` table in Supabase that didn't exist.

**Solution**: ✅ **FIXED** - Removed all database dependencies from the news service. The app now works purely with API data and mock data.

### 2. React Native Text Node Errors

**Problem**: "Unexpected text node: . A text node cannot be a child of a <View>"

**Solution**: This error occurs when text is rendered directly inside a View component without being wrapped in a Text component.

#### Quick Fix
The error is likely coming from a component that has text directly inside a View. Common causes:
- Periods or punctuation marks directly in JSX
- Template literals or expressions that return text
- Comments that are being interpreted as text

#### How to Find and Fix
1. Look for components that might have text directly inside View components
2. Wrap any text in `<Text>` components

### 3. Environment Variables

**Problem**: Missing environment variables for API keys.

**Solution**: Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_NEWS_API_KEY=your_news_api_key_here
EXPO_PUBLIC_GNEWS_API_KEY=your_gnews_api_key_here
```

### 4. News Service Status

The news service now works as follows:
- ✅ **No database dependency** - All database operations removed
- ✅ **API-first approach** - Fetches from News API and GNews API
- ✅ **Mock data fallback** - Uses mock data if APIs fail
- ✅ **In-memory caching** - Caches articles in memory for performance

### 5. Development Commands

```bash
# Start development server
npm run dev

# Check Supabase status (if CLI is available)
npm run supabase:status

# Apply Supabase migrations (if CLI is available)
npm run supabase:migrate
```

## Getting Help

If you continue to experience issues:

1. Check the browser console for specific error messages
2. Ensure all environment variables are set correctly
3. Verify your Supabase project is properly configured (for other features)
4. Make sure all dependencies are installed: `npm install`

## Common Error Messages

- **404 Not Found**: Usually means the database table doesn't exist (now resolved)
- **Text node errors**: Text needs to be wrapped in `<Text>` components
- **Environment variable errors**: Missing `.env` file or incorrect variable names
- **API errors**: News API or GNews API issues (app will fall back to mock data)

## Recent Changes

- ✅ Removed all `news_articles` table dependencies
- ✅ Simplified news service to work without database
- ✅ Added better error handling for API failures
- ✅ Improved mock data fallback system 