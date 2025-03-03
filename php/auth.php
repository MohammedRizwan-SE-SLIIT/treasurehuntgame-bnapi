<?php
// Validate Google ID Token
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'];

    // Verify the token with Google's API
    $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $token;
    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if (isset($data['email'])) {
        // Token is valid; return success response
        echo json_encode([
            'success' => true,
            'username' => $data['name'], // Get user's name from Google profile
        ]);
    } else {
        // Token is invalid; return failure response
        echo json_encode(['success' => false]);
    }
}
?>
