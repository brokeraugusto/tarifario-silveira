-- Insert sample prices for all categories and payment methods for Julho period
INSERT INTO prices_by_category_and_people (category, number_of_people, payment_method, period_id, price_per_night, min_nights) VALUES
-- Standard category
('Standard', 1, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 180.00, 1),
('Standard', 1, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 200.00, 1),
('Standard', 2, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 200.00, 1),
('Standard', 2, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 220.00, 1),
('Standard', 3, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 240.00, 1),
('Standard', 3, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 260.00, 1),
('Standard', 4, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 280.00, 1),
('Standard', 4, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 300.00, 1),

-- Luxo category
('Luxo', 1, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 250.00, 1),
('Luxo', 1, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 270.00, 1),
('Luxo', 2, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 300.00, 1),
('Luxo', 2, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 320.00, 1),
('Luxo', 3, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 350.00, 1),
('Luxo', 3, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 370.00, 1),
('Luxo', 4, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 400.00, 1),
('Luxo', 4, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 420.00, 1),

-- Super Luxo category
('Super Luxo', 1, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 350.00, 1),
('Super Luxo', 1, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 380.00, 1),
('Super Luxo', 2, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 400.00, 1),
('Super Luxo', 2, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 430.00, 1),
('Super Luxo', 3, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 450.00, 1),
('Super Luxo', 3, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 480.00, 1),
('Super Luxo', 4, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 500.00, 1),
('Super Luxo', 4, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 530.00, 1),

-- Master category
('Master', 1, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 500.00, 2),
('Master', 1, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 550.00, 2),
('Master', 2, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 600.00, 2),
('Master', 2, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 650.00, 2),
('Master', 3, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 700.00, 2),
('Master', 3, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 750.00, 2),
('Master', 4, 'pix', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 800.00, 2),
('Master', 4, 'credit_card', '7d73a3a1-edf6-427f-a641-7363a9ed7492', 850.00, 2);