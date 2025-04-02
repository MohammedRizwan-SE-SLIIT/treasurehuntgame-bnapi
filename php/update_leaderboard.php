<?php

require_once __DIR__ . '/config.php';
require_once '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

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

// Retrieve JWT token from Authorization header or query parameter
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $jwt = $matches[1];
} else {
    // Fallback: Retrieve JWT token from query parameter
    $jwt = $_GET['token'] ?? null;
}

if (!$jwt) {
    error_log("Missing JWT token.");
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required.']);
    exit;
}

try {
    // Decode JWT
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
    $userId = $decoded->userId ?? null;

    if (!$userId) {
        throw new Exception("Invalid JWT: User ID missing.");
    }

    // Parse input data
    $input = json_decode(file_get_contents('php://input'), true);
    $highestLevel = $input['highestLevel'] ?? null;
    $totalTreasures = $input['totalTreasures'] ?? null;

    if ($highestLevel === null || $totalTreasures === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input: highestLevel and totalTreasures are required.']);
        exit;
    }

    // Update leaderboard data
    $stmt = $pdo->prepare("
        INSERT INTO leaderboard (user_id, highest_level, total_treasures, last_updated)
        VALUES (:user_id, :highest_level, :total_treasures, NOW())
        ON DUPLICATE KEY UPDATE
            highest_level = GREATEST(highest_level, VALUES(highest_level)),
            total_treasures = GREATEST(total_treasures, VALUES(total_treasures)),
            last_updated = NOW()
    ");
    $stmt->execute([
        ':user_id' => $userId,
        ':highest_level' => $highestLevel,
        ':total_treasures' => $totalTreasures
    ]);

    // Success response
    echo json_encode(['success' => true, 'message' => 'Leaderboard updated successfully.']);
} catch (Exception $e) {
    error_log("Error in update_leaderboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
