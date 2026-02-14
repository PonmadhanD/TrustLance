-- SAMPLE DATA GENERATOR FOR DISPUTE TESTING
-- Run this in Supabase SQL Editor to create a sample contract for testing purposes.

-- 1. Create a Sample Project
INSERT INTO projects (
    client_id, 
    title, 
    description, 
    category, 
    budget_type, 
    budget_range, 
    status,
    experience_level,
    duration
) 
VALUES (
    auth.uid(), -- Uses currently logged in user as client
    'Sample Project for Dispute Testing', 
    'This is a generated sample project to test the dispute resolution system.', 
    'Web Development', 
    'fixed', 
    '1000-5000', 
    'in_progress',
    'intermediate',
    '1-3 months'
);

-- 2. Create a Sample Proposal (Assumes user same ID, or just picks one)
-- In a real scenario, this would be a different user. 
-- For testing "My Projects", we assign the current user as Client.

-- 3. Create a Contract linked to the Project
INSERT INTO contracts (
    project_id,
    proposal_id, -- We'll skip proper proposal link for simplicity or link to a dummy one if needed
    client_id,
    freelancer_id,
    total_amount,
    status,
    milestones,
    start_date
)
VALUES (
    (SELECT id FROM projects WHERE title = 'Sample Project for Dispute Testing' LIMIT 1),
    (SELECT id FROM proposals LIMIT 1), -- Just link to any existing proposal or create one if empty
    auth.uid(), -- Current user is CLIENT
    (SELECT id FROM users WHERE id != auth.uid() LIMIT 1), -- Pick another random user as FREELANCER
    1500.00,
    'active',
    '[
        {"title": "Milestone 1: Research", "description": "Initial research phase", "amount": 500, "status": "completed"},
        {"title": "Milestone 2: Implementation", "description": "Core development", "amount": 500, "status": "active"},
        {"title": "Milestone 3: Delivery", "description": "Final delivery and testing", "amount": 500, "status": "pending"}
    ]'::jsonb,
    NOW()
);

-- Verify
SELECT * FROM contracts WHERE title = 'Sample Project for Dispute Testing';
