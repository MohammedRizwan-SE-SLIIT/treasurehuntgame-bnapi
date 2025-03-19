<?php
session_start();
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "treasure_hunt";

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

$response = ['success' => false];

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
    } else {
        throw new Exception('Update failed: ' . $stmt->error);
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>