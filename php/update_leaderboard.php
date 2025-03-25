<?php
session_start();
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "treasurehunt";


$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

$response = ['success' => false];

// Log actions in the audit_log table
function logAction($conn, $userId, $action, $details, $gameId = null, $levelId = null) {
    $stmt = $conn->prepare("INSERT INTO audit_log (user_id, action, details, game_id, level_id) VALUES (?, ?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("issii", $userId, $action, $details, $gameId, $levelId);
        $stmt->execute();
    }
}

try {
    if (empty($_SESSION['user_id'])) {
        throw new Exception('Authentication required');
    }

    $userId = $_SESSION['user_id'];
    $highestLevel = $_POST['highestLevel'];
    $totalTreasures = $_POST['totalTreasures'];

    // Update leaderboard
    $stmt = $conn->prepare("INSERT INTO leaderboard (user_id, highest_level, total_treasures, last_updated) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE highest_level = GREATEST(highest_level, VALUES(highest_level)), total_treasures = GREATEST(total_treasures, VALUES(total_treasures)), last_updated = NOW()");
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    $stmt->bind_param("iii", $userId, $highestLevel, $totalTreasures);
    if ($stmt->execute()) {
        $response['success'] = true;

        // Update ranks in the leaderboard
        $conn->query("SET @rank = 0");
        $conn->query("UPDATE leaderboard SET rank = (@rank := @rank + 1) ORDER BY total_treasures DESC, highest_level DESC, last_updated ASC");
    } else {
        throw new Exception('Update failed: ' . $stmt->error);
    }

    // Log actions
    logAction($conn, $userId, 'GAME_START', 'User started a new game', 101, null);
    logAction($conn, $userId, 'TREASURE_COLLECTED', 'User collected 5 treasures', 101, 1);
    logAction($conn, $userId, 'GAME_END', 'User finished the game', 101, null);

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
