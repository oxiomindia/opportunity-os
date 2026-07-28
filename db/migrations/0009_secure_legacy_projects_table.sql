-- public.projects is a legacy table unrelated to the Invoice Software schema.
-- Left in place per product decision; locked down with RLS and no policies so it
-- is completely inaccessible to anon/authenticated roles until reviewed post-v1.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
