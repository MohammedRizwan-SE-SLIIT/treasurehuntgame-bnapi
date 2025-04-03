<?php

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    // Fetch leaderboard data
    $stmt = $pdo->query("
        SELECT u.username, l.highest_level, l.total_treasures, l.rank
        FROM leaderboard l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.rank ASC, l.total_treasures DESC, l.highest_level DESC, l.last_updated ASC
        LIMIT 100
    ");
    $leaderboardData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log the response for debugging
    error_log("Leaderboard Data: " . json_encode($leaderboardData));

    echo json_encode([
        'success' => true,
        'leaderboardData' => $leaderboardData
    ]);
} catch (Exception $e) {
    error_log("Error in get_leaderboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
