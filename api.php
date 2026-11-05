<?php
while (ob_get_level()) ob_end_clean();
ob_start();

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'jg_streetfood';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$db`;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `full_name` VARCHAR(100) NOT NULL,
      `username` VARCHAR(50) NOT NULL UNIQUE,
      `phone` VARCHAR(20) NOT NULL,
      `password` VARCHAR(255) NOT NULL,
      `role` ENUM('customer', 'admin') DEFAULT 'customer',
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `orders` (
      `id` VARCHAR(30) PRIMARY KEY,
      `user_id` VARCHAR(50) NOT NULL,
      `customer_name` VARCHAR(100) NOT NULL,
      `phone` VARCHAR(20) NOT NULL,
      `items_summary` TEXT NOT NULL,
      `customer_notes` TEXT NULL,
      `fulfillment` VARCHAR(100) NOT NULL,
      `payment_method` VARCHAR(30) NOT NULL,
      `total` DECIMAL(10,2) NOT NULL,
      `status` ENUM('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled') DEFAULT 'Pending',
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'MySQL Error: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    switch ($action) {

        // AUTOMATIC IMAGE SCANNER: Babasahin ang lahat ng files sa loob ng images/
        case 'scan_images':
            $folder = __DIR__ . '/images';
            $files = is_dir($folder) ? scandir($folder) : [];
            $map = [];
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    $cleanKey = strtolower(preg_replace('/[^a-z0-9]/', '', pathinfo($file, PATHINFO_FILENAME)));
                    $map[$cleanKey] = 'images/' . $file;
                }
            }
            echo json_encode(['success' => true, 'images' => $map]);
            break;

        case 'register':
            $fullName = trim($input['fullName'] ?? '');
            $username = trim($input['username'] ?? '');
            $phone    = trim($input['phone'] ?? '');
            $password = trim($input['password'] ?? '');
            $role     = trim($input['role'] ?? 'customer');

            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => "May gumagamit na ng username na '@$username'!"]);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO users (full_name, username, phone, password, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$fullName, $username, $phone, $password, $role]);
            echo json_encode(['success' => true]);
            break;

        case 'login':
            $username = trim($input['username'] ?? '');
            $password = trim($input['password'] ?? '');

            $stmt = $pdo->prepare("SELECT id, full_name, username, phone, role, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user || $user['password'] !== $password) {
                echo json_encode(['success' => false, 'message' => 'Maling username o password.']);
                exit;
            }
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);
            break;

        case 'create_order':
            $id          = $input['id'] ?? ('JG-' . rand(1000, 9999));
            $userId      = $input['userId'] ?? 'GUEST';
            $customer    = $input['customerName'] ?? 'Guest';
            $phone       = $input['phone'] ?? 'N/A';
            $summary     = $input['itemsSummary'] ?? '';
            $notes       = $input['customerNotes'] ?? '';
            $fulfillment = $input['fulfillment'] ?? 'Stall Pickup';
            $payment     = $input['paymentMethod'] ?? 'Cash';
            $total       = floatval($input['total'] ?? 0);

            $stmt = $pdo->prepare("INSERT INTO orders (id, user_id, customer_name, phone, items_summary, customer_notes, fulfillment, payment_method, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
            $stmt->execute([$id, $userId, $customer, $phone, $summary, $notes, $fulfillment, $payment, $total]);
            echo json_encode(['success' => true, 'ticketId' => $id]);
            break;

        case 'get_orders':
            $userId = trim($_GET['user_id'] ?? '');
            if ($userId && strtolower($userId) !== 'admin') {
                $stmt = $pdo->prepare("SELECT * FROM orders WHERE LOWER(user_id) = LOWER(?) OR LOWER(customer_name) = LOWER(?) ORDER BY created_at DESC");
                $stmt->execute([$userId, $userId]);
            } else {
                $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
            }
            echo json_encode(['success' => true, 'orders' => $stmt->fetchAll()]);
            break;

        case 'update_order_status':
            $orderId = trim($input['orderId'] ?? '');
            $status  = trim($input['status'] ?? 'Pending');

            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$status, $orderId]);
            echo json_encode(['success' => true, 'message' => "Order #$orderId updated!"]);
            break;

        case 'get_users':
            $stmt = $pdo->query("SELECT id, full_name, username, phone, role, created_at FROM users ORDER BY created_at DESC");
            echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
            break;

        default:
            echo json_encode(['success' => false]);
            break;
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}