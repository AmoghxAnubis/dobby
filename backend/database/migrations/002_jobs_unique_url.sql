-- Add unique constraint to jobs table for deduplication
ALTER TABLE jobs ADD CONSTRAINT jobs_url_key UNIQUE (url);
