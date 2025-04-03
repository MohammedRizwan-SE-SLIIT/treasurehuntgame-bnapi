<?php

require_once realpath(__DIR__ . '/../config.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

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

// Retrieve JWT token from Authorization header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    error_log("Missing or invalid Authorization header.");
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required.']);
    exit;
}

$jwt = $matches[1];

try {
    // Decode JWT
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
    $userId = $decoded->userId ?? null;

    if (!$userId) {
        throw new Exception("Invalid JWT: User ID missing.");
    }

    // Parse input data
    $input = json_decode(file_get_contents('php://input'), true);
    $currentLevel = $input['currentLevel'] ?? null;
    $treasuresCollected = $input['treasuresCollected'] ?? null;
    $totalAttempts = $input['totalAttempts'] ?? null;
    $correctAnswers = $input['correctAnswers'] ?? null;

    if ($currentLevel === null || $treasuresCollected === null || $totalAttempts === null || $correctAnswers === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input: All fields are required.']);
        exit;
    }

    // Insert or update user progress
    $stmt = $pdo->prepare("
        INSERT INTO user_progress 
        (user_id, level_id, treasures_collected, attempts, correct_answers)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $userId,
        $currentLevel,
        $treasuresCollected,
        $totalAttempts,
        $correctAnswers
    ]);

    // Update leaderboard directly
    $stmt = $pdo->prepare("
        UPDATE leaderboard SET
        highest_level = GREATEST(highest_level, ?),
        total_treasures = total_treasures + ?,
        last_updated = NOW()
        WHERE user_id = ?
    ");
    $stmt->execute([$currentLevel, $treasuresCollected, $userId]);

    echo json_encode(['success' => true, 'message' => 'Leaderboard and progress updated successfully.']);
} catch (Exception $e) {
    error_log("Error in update_leaderboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
