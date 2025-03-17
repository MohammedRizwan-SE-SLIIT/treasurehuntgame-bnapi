<?php

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

$autoloadPath = realpath(__DIR__ . '/../vendor/autoload.php');
if (!$autoloadPath) {
    error_log("Error: autoload.php not found at expected path.");
    die(json_encode(['success' => false, 'error' => 'Server configuration error.']));
}
require $autoloadPath; // Dynamically resolved path to autoload.php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$host = 'localhost';
$dbname = 'treasure_hunt';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die("Connection failed: " . $e->getMessage());
}

$secretKey = '5982ffcceb7bd37de639e651f7308a4a7749545bc1fbff57d34fe15eb3b83bac'; // Replace with a strong secret key

function generateJWT($userId, $username) {
    global $secretKey;
    $payload = [
        'userId' => $userId,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + 3600 // Token expires in 1 hour
    ];
    return JWT::encode($payload, $secretKey, 'HS256');
}

function verifyJWT($token) {
    global $secretKey;
    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}

function registerUser($pdo, $username, $email, $password) {
    $salt = bin2hex(random_bytes(16)); // Generate a random salt
    $hashedPassword = password_hash($password . $salt, PASSWORD_DEFAULT); // Hash the password with the salt
    $passwordWithSalt = $salt . $hashedPassword; // Concatenate salt and hashed password

    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$username, $email, $passwordWithSalt]);
    error_log("New user registered Name: $username");
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

            if (empty($username) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'All fields are required.']);
                exit;
            }

            $userId = registerUser($pdo, $username, $email, $password);
            $token = generateJWT($userId, $username);
            error_log("JWT token generated for user ID: $userId");

            $_SESSION['userId'] = $userId;
            $_SESSION['username'] = $username;

            echo json_encode(['success' => true, 'userId' => $userId, 'token' => $token, 'message' => 'Registration successful.']);
            error_log("Response sent for username: $username");
            exit;

        case 'login':
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';

            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Please fill in all fields.']);
                exit;
            }

            $userId = verifyPassword($pdo, $username, $password);

            if ($userId) {
                $token = generateJWT($userId, $username);

                $_SESSION['userId'] = $userId;
                $_SESSION['username'] = $username;

                echo json_encode(['success' => true, 'userId' => $userId, 'token' => $token, 'message' => 'Login successful.']);
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