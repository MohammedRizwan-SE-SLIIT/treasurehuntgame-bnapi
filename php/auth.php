<?php
// Set the necessary headers to enable communication between the main window and the popup window
header("Cross-Origin-Opener-Policy: same-origin");
header("Cross-Origin-Embedder-Policy: require-corp");

// Validate Google ID Token
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['token'])) {
        $token = $input['token'];

        // Use cURL to verify the token with Google's API
        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $token;

        // Initialize cURL session
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Enable SSL verification

        $response = curl_exec($ch);

        // Check for cURL errors
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            echo json_encode(['success' => false, 'error' => 'cURL error: ' . $error_msg]);
            exit;
        }

        curl_close($ch);

        // Check if response is valid and decode it
        $data = json_decode($response, true);

        if ($data && isset($data['email'])) {
            // Token is valid; set session or other user data here
            session_start();
            $_SESSION['username'] = $data['name']; // Example: Store username in session

            // Return the redirect URL after successful authentication
            $redirectURL = '/treasurehuntgame-bnapi/game/game.html'; // Ensure this path is correct for your app
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'redirect' => $redirectURL]);
            exit;
        } else {
            // Token is invalid or error occurred
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Invalid token']);
            exit;
        }
    } else {
        // Token is not set in the request
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'No token provided']);
        exit;
    }
}
?>
