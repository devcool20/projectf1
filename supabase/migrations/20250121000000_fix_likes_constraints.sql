-- Fix conflicting constraints in likes table
-- First, drop the conflicting constraints
ALTER TABLE "public"."likes" DROP CONSTRAINT IF EXISTS "thread_or_reply_like";
ALTER TABLE "public"."likes" DROP CONSTRAINT IF EXISTS "check_thread_or_repost";

-- Create a unified constraint that allows exactly one of thread_id, reply_id, or repost_id to be set
ALTER TABLE "public"."likes" 
ADD CONSTRAINT "likes_single_target_check" CHECK (
  (thread_id IS NOT NULL AND reply_id IS NULL AND repost_id IS NULL) OR
  (thread_id IS NULL AND reply_id IS NOT NULL AND repost_id IS NULL) OR
  (thread_id IS NULL AND reply_id IS NULL AND repost_id IS NOT NULL)
);

-- Drop old unique indexes
DROP INDEX IF EXISTS "likes_unique_thread_like";
DROP INDEX IF EXISTS "likes_unique_reply_like";

-- Create new unique indexes for each type
CREATE UNIQUE INDEX "likes_unique_thread_like" ON "public"."likes" (user_id, thread_id)
  WHERE (thread_id IS NOT NULL AND reply_id IS NULL AND repost_id IS NULL);

CREATE UNIQUE INDEX "likes_unique_reply_like" ON "public"."likes" (user_id, reply_id)
  WHERE (thread_id IS NULL AND reply_id IS NOT NULL AND repost_id IS NULL);

CREATE UNIQUE INDEX "likes_unique_repost_like" ON "public"."likes" (user_id, repost_id)
  WHERE (thread_id IS NULL AND reply_id IS NULL AND repost_id IS NOT NULL); 