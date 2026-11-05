CREATE DATABASE IF NOT EXISTS `jg_streetfood` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `jg_streetfood`;

-- 1. Table Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `provider` VARCHAR(20) DEFAULT 'standard',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Table Orders (May Live Status Tracking)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(30) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `items_summary` TEXT NOT NULL,
  `customizations` TEXT NULL,
  `fulfillment` VARCHAR(100) NOT NULL,
  `payment_method` VARCHAR(30) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `status` ENUM('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Table Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `badge` VARCHAR(50) DEFAULT 'Fresh'
) ENGINE=InnoDB;

-- Seed Default Menu
INSERT INTO `products` (`id`, `title`, `description`, `price`, `category`, `badge`) VALUES
(1, 'JG1 (Drinks + Fries)', 'Solo crispy fries & cold palamig juice', 30.00, 'combo', 'Best Value'),
(2, 'JG2 (Drinks + Fries + Kikiam)', 'Solo fries, 3 pcs kikiam & cold drink', 35.00, 'combo', 'Bestseller'),
(3, 'JG3 (Drinks + Fries + Hotdog)', 'Solo fries, 3 pcs red hotdog & juice', 40.00, 'combo', 'Heavy Meryenda'),
(4, 'Fishball (7 pcs)', 'Golden fried street fishballs with sauce', 5.00, 'street', 'Classic ₱5'),
(5, 'Kikiam (3 pcs)', 'Savory fried spiced kikiam skewers', 5.00, 'street', 'Crispy'),
(6, 'Pinoy Hotdog (3 pcs)', 'Tender Filipino cocktail red hotdogs', 10.00, 'street', 'Favorite'),
(7, 'Solo Fries', 'Crispy seasoned golden potato french fries', 25.00, 'street', 'Hot Fry'),
(8, 'Lemon Juice Palamig', 'Cold dispenser-chilled lemon refresher', 10.00, 'drinks', 'Cold Palamig'),
(9, 'Pineapple Juice Palamig', 'Sweet tropical chilled pineapple cooler', 10.00, 'drinks', 'Tropical'),
(10, 'YEMA CAKE (Tub)', 'Soft sponge cake covered in sweet custard yema', 135.00, 'cakes', 'Tub Bestseller'),
(11, 'UBE CAKE (Tub)', 'Authentic purple yam cake in sealed tub', 135.00, 'cakes', 'Halaya Cake'),
(12, 'CHOCOLATE CAKE (Tub)', 'Moist chocolate ganache fudge cake', 135.00, 'cakes', 'Fudge Tub'),
(13, 'DARK CHOCO CAKE (Tub)', 'Semi-sweet dark cocoa decadent tub cake', 135.00, 'cakes', 'Dark Cocoa')
ON DUPLICATE KEY UPDATE `title`=`title`;