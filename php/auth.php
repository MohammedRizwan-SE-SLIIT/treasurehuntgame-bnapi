<?php
session_start();

// Database configuration
$host = 'localhost';        // Database host
$dbname = 'treasurehunt';   // Database name
$user = 'root';             // Database user
$pass = '';                 // Database password (leave blank for default)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Function to securely register a new user
function registerUser($pdo, $username, $email, $password) {
    // Generate a unique salt
    $salt = bin2hex(random_bytes(16));

    // Hash the password with the salt
    $hashedPassword = password_hash($password . $salt, PASSWORD_DEFAULT);

    // Insert user into the database
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, salt) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashedPassword, $salt]);

    // Return the user ID of the newly registered user
    return $pdo->lastInsertId();
}

// Function to securely verify a user's password during login
function verifyPassword($pdo, $username, $password) {
    // Retrieve user data from the database
    $stmt = $pdo->prepare("SELECT id, password, salt FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // If user exists and password matches
    if ($user && password_verify($password . $user['salt'], $user['password'])) {
        return $user['id']; // Return user ID upon successful login
    }

    return false; // Return false if login fails
}

// Function to create or update virtual identity
function saveVirtualIdentity($pdo, $userId, $displayName, $avatarUrl) {
    // Check if the user already has a virtual identity
    $stmt = $pdo->prepare("SELECT id FROM virtual_identity WHERE user_id = ?");
    $stmt->execute([$userId]);
    $identity = $stmt->fetch();

    if ($identity) {
        // Update existing virtual identity
        $stmt = $pdo->prepare("UPDATE virtual_identity SET display_name = ?, avatar_url = ? WHERE user_id = ?");
        $stmt->execute([$displayName, $avatarUrl, $userId]);
    } else {
        // Create new virtual identity
        $stmt = $pdo->prepare("INSERT INTO virtual_identity (user_id, display_name, avatar_url) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $displayName, $avatarUrl]);
    }
}

// Handle requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'register':
            // Retrieve registration data
            $username = $_POST['register-username'] ?? '';
            $email = $_POST['register-email'] ?? '';
            $password = $_POST['register-password'] ?? '';

            if (empty($username) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'All fields are required.']);
                exit;
            }

            // Register the new user
            $userId = registerUser($pdo, $username, $email, $password);
            
            // Start the session and store user info
            $_SESSION['userId'] = $userId;
            $_SESSION['username'] = $username;

            echo json_encode(['success' => true, 'userId' => $userId, 'message' => 'Registration successful. Please create your virtual identity.']);
            exit;

        case 'login':
            // Retrieve login data
            $username = $_POST['login-username'] ?? '';
            $password = $_POST['login-password'] ?? '';

            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Please fill in all fields.']);
                exit;
            }

            // Verify password
            $userId = verifyPassword($pdo, $username, $password);

            if ($userId) {
                // Start the session and store user info
                $_SESSION['userId'] = $userId;
                $_SESSION['username'] = $username;
                
                // Return the user ID and the success indicator
                echo json_encode(['success' => true, 'userId' => $userId, 'message' => 'Login successful. Please create your virtual identity.']);
                exit;
            } else {
                // Invalid credentials
                echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
                exit;
            }
        case 'create_identity':
            // Verify that the user is logged in
            if (!isset($_SESSION['userId'])) {
                echo json_encode(['success' => false, 'error' => 'User not logged in']);
                exit;
            }
            
            // Get data from POST request
            $userId = $_SESSION['userId'];
            $displayName = $_POST['displayName'] ?? '';
            $avatarUrl = $_POST['avatarUrl'] ?? '';

            // Save the virtual identity to the database
            saveVirtualIdentity($pdo, $userId, $displayName, $avatarUrl);

            // Return the redirect URL after successful validation
            echo json_encode(['success' => true, 'redirect' => '/treasurehuntgame-bnapi/game/game.html']);
            exit;
      default:
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
            exit;
    }
}
?>
