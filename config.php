
<?php

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'treasurehunt');
define('DB_USER', 'root');
define('DB_PASS', '');

// JWT configuration
define('JWT_SECRET_KEY', '5982ffcceb7bd37de639e651f7308a4a7749545bc1fbff57d34fe15eb3b83bac'); 

// Application configuration
define('APP_NAME', 'Treasure Hunt Game');
define('APP_URL', 'http://localhost/treasurehuntgame-bnapi');

// Error reporting (for development purposes)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die("Connection failed: " . $e->getMessage());
}
?>
