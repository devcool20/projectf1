-- Migration: Fix repost_replies.user_id foreign key to reference profiles(id)

ALTER TABLE public.repost_replies DROP CONSTRAINT IF EXISTS repost_replies_user_id_fkey;
ALTER TABLE public.repost_replies
  ADD CONSTRAINT repost_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id); 