<?php
// validate.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'config.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

// Get JSON Input
$input = json_decode(file_get_contents('php://input'), true);
$token_number = $input['token_number'] ?? null;

if (!$token_number) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token number is required']);
    exit();
}

$dbconn = getDBConnection();
if (!$dbconn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Prepare Statement
$query = "SELECT token_number, register_date, status_active FROM token_validations WHERE token_number = $1 LIMIT 1";
$result = pg_query_params($dbconn, $query, array($token_number));

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Query error: ' . pg_last_error($dbconn)]);
    exit();
}

$row = pg_fetch_assoc($result);

if (!$row) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Token not found']);
} else {
    // Check status
    $isActive = ($row['status_active'] === 't' || $row['status_active'] === true || $row['status_active'] == 1);
    
    if (!$isActive) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Token is not active',
            'data' => $row
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Token is valid',
            'data' => $row
        ]);
    }
}

pg_close($dbconn);
?>
