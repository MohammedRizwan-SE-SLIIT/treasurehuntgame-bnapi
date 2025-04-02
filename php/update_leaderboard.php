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

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required.']);
    exit;
}

$jwt = $matches[1];

try {
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
    $userId = $decoded->userId;

    $highestLevel = $_POST['highestLevel'] ?? null;
    $totalTreasures = $_POST['totalTreasures'] ?? null;

    if (!$highestLevel || !$totalTreasures) {
        throw new Exception('Invalid input data.');
    }

    $stmt = $pdo->prepare("
        INSERT INTO leaderboard (user_id, highest_level, total_treasures, last_updated)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        highest_level = GREATEST(highest_level, VALUES(highest_level)),
        total_treasures = GREATEST(total_treasures, VALUES(total_treasures)),
        last_updated = NOW()
    ");
    $stmt->execute([$userId, $highestLevel, $totalTreasures]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
