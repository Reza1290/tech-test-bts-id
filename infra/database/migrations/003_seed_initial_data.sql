-- Migration 003: Seed default user and sample products
INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`, `updated_at`)
VALUES (1, 'jhon_doe', '$2b$10$UawZa0ojhJJ0.FbkoaVun.OetZcBJR8rSS1eRiXYJQa.CQ5UTeO32', '2025-01-01 15:01:04', '2025-01-01 15:01:04')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

INSERT INTO `products` (`id`, `title`, `price`, `description`, `category`, `images`, `created_at`, `created_by`, `created_by_id`, `updated_at`, `updated_by`, `updated_by_id`)
VALUES
(1, 'Awesome T-Shirt', 99.99, 'High-quality cotton t-shirt', 'Clothes', '["https://placeimg.com/640/480/any"]', '2025-01-01 15:01:04', 'Jhon Doe', '1', '2025-01-01 15:01:04', 'Jhon Doe', '1'),
(2, 'Classic Denim Jeans', 129.50, 'Comfortable slim-fit denim jeans', 'Clothes', '["https://placeimg.com/640/480/any"]', '2025-01-02 10:15:00', 'Jhon Doe', '1', '2025-01-02 10:15:00', 'Jhon Doe', '1'),
(3, 'Wireless Noise-Canceling Headphones', 199.99, 'Premium over-ear wireless headphones with ANC', 'Electronics', '["https://placeimg.com/640/480/any"]', '2025-01-03 12:00:00', 'Jhon Doe', '1', '2025-01-03 12:00:00', 'Jhon Doe', '1')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
