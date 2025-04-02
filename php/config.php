<?php

define('DB_HOST', 'localhost'); 
define('DB_NAME', 'treasurehunt'); 
define('DB_USER', 'root'); 
define('DB_PASS', ''); 


// 5982ffcceb7bd37de639e651f7308a4a7749545bc1fbff57d34fe15eb3b83bac
// define('JWT_SECRET_KEY', '4f7a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f'); // Replace with a strong secret key
// JWT configuration
define('JWT_SECRET_KEY', '5982ffcceb7bd37de639e651f7308a4a7749545bc1fbff57d34fe15eb3b83bac'); // Replace with a strong secret key

// App config
define('APP_NAME', 'Treasure Hunt Game'); // Application name
define('APP_URL', 'http://localhost/treasurehuntgame-bnapi'); 
// Rep Error (dev purposes)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// date_default_timezone_set('UTC+05:30'); // Set the default tz

    
?>