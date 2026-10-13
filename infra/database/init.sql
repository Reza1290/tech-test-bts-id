-- BTS.id Backend Recruitment Test Database Initialization
-- Application Database Schema

CREATE DATABASE IF NOT EXISTS `bts_recruitment_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `bts_recruitment_db`;

-- Table structure for table `users`
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `products`
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `images` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(100) NOT NULL,
  `created_by_id` VARCHAR(50) NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` VARCHAR(100) NOT NULL,
  `updated_by_id` VARCHAR(50) NOT NULL,
  INDEX `idx_products_category` (`category`),
  INDEX `idx_products_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default user: jhon_doe / supersecret
-- Password hash generated with bcryptjs rounds 10
INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 'jhon_doe', '$2b$10$UawZa0ojhJJ0.FbkoaVun.OetZcBJR8rSS1eRiXYJQa.CQ5UTeO32', '2025-01-01 15:01:04', '2025-01-01 15:01:04');

-- Seed initial products matching specification
INSERT INTO `products` (`id`, `title`, `price`, `description`, `category`, `images`, `created_at`, `created_by`, `created_by_id`, `updated_at`, `updated_by`, `updated_by_id`) VALUES
(1, 'Awesome T-Shirt', 99.99, 'High-quality cotton t-shirt', 'Clothes', '["https://placeimg.com/640/480/any"]', '2025-01-01 15:01:04', 'Jhon Doe', '1', '2025-01-01 15:01:04', 'Jhon Doe', '1'),
(2, 'Classic Denim Jeans', 129.50, 'Comfortable slim-fit denim jeans', 'Clothes', '["https://placeimg.com/640/480/any"]', '2025-01-02 10:15:00', 'Jhon Doe', '1', '2025-01-02 10:15:00', 'Jhon Doe', '1'),
(3, 'Wireless Noise-Canceling Headphones', 199.99, 'Premium over-ear wireless headphones with ANC', 'Electronics', '["https://placeimg.com/640/480/any"]', '2025-01-03 12:00:00', 'Jhon Doe', '1', '2025-01-03 12:00:00', 'Jhon Doe', '1');

-- Permissions Grant
GRANT ALL PRIVILEGES ON `bts_recruitment_db`.* TO 'bts_user'@'%';
FLUSH PRIVILEGES;
