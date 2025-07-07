-- 1. Make thread_id nullable
ALTER TABLE "public"."likes"
  ALTER COLUMN "thread_id" DROP NOT NULL;

-- 2. Add reply_id column with a foreign key to replies
ALTER TABLE "public"."likes"
  ADD COLUMN "reply_id" uuid;

ALTER TABLE "public"."likes"
  ADD CONSTRAINT "likes_reply_id_fkey" FOREIGN KEY (reply_id) REFERENCES replies (id) ON DELETE CASCADE;

-- 3. Add a check constraint to ensure a like is for a thread OR a reply
ALTER TABLE "public"."likes"
  ADD CONSTRAINT "thread_or_reply_like" CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR (thread_id IS NULL AND reply_id IS NOT NULL)
  );

-- 4. Drop the old unique constraint (the name is inferred from the table and columns)
ALTER TABLE "public"."likes"
  DROP CONSTRAINT "likes_user_id_thread_id_key";

-- 5. Create new partial unique indexes
CREATE UNIQUE INDEX "likes_unique_thread_like" ON "public"."likes" (user_id, thread_id)
  WHERE (reply_id IS NULL);

CREATE UNIQUE INDEX "likes_unique_reply_like" ON "public"."likes" (user_id, reply_id)
  WHERE (thread_id IS NULL); 