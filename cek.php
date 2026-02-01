<?php
// cek.php
header("Content-Type: application/json");
require_once 'config.php';

$start = microtime(true);
$dbconn = getDBConnection();
$duration = (microtime(true) - $start) * 1000;

if ($dbconn) {
    echo json_encode([
        'status' => 'ok',
        'message' => 'Connected to PostgreSQL successfully',
        'connection_time_ms' => round($duration, 2)
    ]);
    pg_close($dbconn);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection Failed',
        'error_details' => error_get_last()
    ]);
}
?>