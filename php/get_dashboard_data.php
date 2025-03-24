<?php
session_start();
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "treasurehunt";

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

    // Fetch user data
    $stmt = $conn->prepare("SELECT username, display_name, avatar_url FROM users WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userData = $stmt->get_result()->fetch_assoc();

    // Fetch user progress
    $stmt = $conn->prepare("SELECT MAX(level_id) AS highest_level, SUM(treasures_collected) AS total_treasures FROM user_progress WHERE user_id = ?");
    if (!$stmt) {
        throw new Exception('Prepare statement failed: ' . $conn->error);
    }
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userProgress = $stmt->get_result()->fetch_assoc();

    // Fetch leaderboard data dynamically
    $leaderboardData = [];
    $result = $conn->query("SELECT u.username, u.display_name, l.highest_level, l.total_treasures FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY l.total_treasures DESC, l.highest_level DESC, l.last_updated ASC LIMIT 100");
    while ($row = $result->fetch_assoc()) {
        $leaderboardData[] = $row;
    }

    $response = [
        'success' => true,
        'userData' => $userData,
        'userProgress' => $userProgress,
        'leaderboardData' => $leaderboardData
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>
