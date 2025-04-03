<?php

require_once __DIR__ . '/../config.php'; // Ensure config.php is included
require_once '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

// Ensure $pdo is accessible
global $pdo;

if (!isset($pdo)) {
    error_log("Database connection (PDO) is not available in auth.php.");
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: Database connection not available.']);
    exit;
}

$autoloadPath = realpath(__DIR__ . '/../vendor/autoload.php');
if (!$autoloadPath) {
    error_log("Error: autoload.php not found at expected path.");
    echo json_encode(['success' => false, 'error' => 'Server configuration error.']);
    exit;
}
require $autoloadPath; // Dynamically resolved path to autoload.php

function generateJWT($userId, $username) {
    $payload = [
        'userId' => $userId,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + 3600 // Token expires in 1 hour
    ];
    return JWT::encode($payload, JWT_SECRET_KEY, 'HS256');
}

function verifyJWT($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}

function registerUser($pdo, $username, $email, $password, $avatarUrl) {
    $salt = bin2hex(random_bytes(16)); // Generate a random salt
    $hashedPassword = password_hash($password . $salt, PASSWORD_DEFAULT); // Hash the password with the salt
    $passwordWithSalt = $salt . $hashedPassword; // Concatenate salt and hashed password

    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, avatar_url) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$username, $email, $passwordWithSalt, $avatarUrl]);
    error_log("New user registered: $username");
    return $pdo->lastInsertId();
}

function verifyPassword($pdo, $username, $password) {
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user) {
        $storedPasswordWithSalt = $user['password'];
        $salt = substr($storedPasswordWithSalt, 0, 32); // Extract the salt (first 32 characters)
        $hashedPassword = substr($storedPasswordWithSalt, 32); // Extract the hashed password

        if (password_verify($password . $salt, $hashedPassword)) {
            return $user['id'];
        }
    }
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'register':
            $username = $input['username'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $avatarUrl = $input['avatarUrl'] ?? ''; // Ensure avatarUrl is retrieved

            if (empty($username) || empty($email) || empty($password) || empty($avatarUrl)) {
                echo json_encode(['success' => false, 'error' => 'All fields are required, including avatar selection.']);
                exit;
            }

            try {
                $userId = registerUser($pdo, $username, $email, $password, $avatarUrl);
                $token = generateJWT($userId, $username);

                $_SESSION['userId'] = $userId;
                $_SESSION['username'] = $username;

                echo json_encode(['success' => true, 'userId' => $userId, 'token' => $token, 'message' => 'Registration successful.']);
            } catch (Exception $e) {
                error_log("Error during registration: " . $e->getMessage());
                echo json_encode(['success' => false, 'error' => 'Registration failed. Please try again.']);
            }
            exit;

        case 'login':
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';

            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Please fill in all fields.']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id, avatar_url FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && verifyPassword($pdo, $username, $password)) {
                $userId = $user['id'];
                $avatarUrl = $user['avatar_url'];
                $token = generateJWT($userId, $username);

                $_SESSION['userId'] = $userId;
                $_SESSION['username'] = $username;

                echo json_encode([
                    'success' => true,
                    'userId' => $userId,
                    'token' => $token,
                    'avatarUrl' => $avatarUrl,
                    'message' => 'Login successful.'
                ]);
                exit;
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
                exit;
            }

        default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
            exit;
    }
}
?>