-- Feedback System Schema

-- 1. REVIEWS (For Freelancers)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id), -- Client
  reviewee_id UUID NOT NULL REFERENCES users(id), -- Freelancer
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- 2. SITE REVIEWS (For Platform)
CREATE TABLE IF NOT EXISTS site_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id), -- Optional link to a project
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_site_reviews_user_id ON site_reviews(user_id);

-- 4. TRIGGER TO UPDATE USER RATING
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_rating DECIMAL(3, 2);
  new_count INTEGER;
BEGIN
  -- Calculate new average rating
  SELECT 
    COALESCE(AVG(rating), 0), 
    COUNT(*) 
  INTO 
    new_rating, 
    new_count
  FROM reviews 
  WHERE reviewee_id = NEW.reviewee_id;

  -- Update user table
  UPDATE users 
  SET 
    rating = new_rating,
    total_reviews = new_count
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_submitted
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
