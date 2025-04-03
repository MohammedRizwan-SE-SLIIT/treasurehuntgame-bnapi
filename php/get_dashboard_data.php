<?php

require_once __DIR__ . '/../config.php';
require_once '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


if (!isset($pdo)) {
    error_log("Database connection (PDO) is not available.");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: Database connection not available.']);
    exit;
}

// Retrieve Authorization Header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    error_log("Missing or invalid Authorization header.");
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required.']);
    exit;
}

$jwt = $matches[1];

try {
    //jwt dec
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
    $userId = $decoded->userId ?? null;

    if (!$userId) {
        throw new Exception("Invalid JWT: User ID missing.");
    }

    // Fetch user data and progress
    $stmt = $pdo->prepare("
        SELECT 
            u.username,
            MAX(up.level_id) AS highest_level,
            SUM(up.treasures_collected) AS total_treasures,
            l.rank
        FROM users u
        JOIN user_progress up ON u.id = up.user_id
        LEFT JOIN leaderboard l ON u.id = l.user_id
        WHERE u.id = ?
        GROUP BY u.id
    ");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        throw new Exception("User not found in the database.");
    }

    // Fetch leaderboard data
    $stmt = $pdo->query("
        SELECT u.username, l.highest_level, l.total_treasures, l.rank
        FROM leaderboard l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.rank ASC, l.total_treasures DESC, l.highest_level DESC, l.last_updated ASC
        LIMIT 100
    ");
    $leaderboardData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'userData' => $userData,
        'leaderboardData' => $leaderboardData
    ]);
} catch (Exception $e) {
    error_log("Error in get_dashboard_data.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>