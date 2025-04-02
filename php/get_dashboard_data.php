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

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Ensure PDO is available
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
error_log("JWT Token: " . $jwt); // Log the JWT token

try {
    // Decode JWT
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
    error_log("Decoded JWT: " . json_encode($decoded)); 

    // Extract user ID
    $userId = $decoded->userId ?? null;
    if (!$userId) {
        throw new Exception("Invalid JWT: User ID missing.");
    }

    // Fetch user data
    $stmt = $pdo->prepare("SELECT username, display_name, avatar_url FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        throw new Exception("User not found in the database.");
    }

    // Fetch user progress
    $stmt = $pdo->prepare("
        SELECT MAX(level_id) AS highest_level, SUM(treasures_collected) AS total_treasures
        FROM user_progress
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $userProgress = $stmt->fetch(PDO::FETCH_ASSOC);

    // Fetch leaderboard data
    $stmt = $pdo->query("
        SELECT u.username, u.display_name, l.highest_level, l.total_treasures, l.rank
        FROM leaderboard l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.rank ASC, l.total_treasures DESC, l.highest_level DESC, l.last_updated ASC
        LIMIT 100
    ");
    $leaderboardData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Send success response
    echo json_encode([
        'success' => true,
        'userData' => $userData,
        'userProgress' => $userProgress,
        'leaderboardData' => $leaderboardData
    ]);
} catch (Exception $e) {
    error_log("Error in get_dashboard_data.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>