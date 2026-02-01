<?php
// config.php

// Konfigurasi Database
$host = '103.127.139.112'; // Ganti dengan IP VPS jika script tidak di server yang sama
$port = '5433';
$dbname = 'ukasir-offline';
$user = 'postgres';
$password = 'Indonesia12345';

$connection_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password}";

function getDBConnection()
{
    global $connection_string;
    $dbconn = pg_connect($connection_string);

    if (!$dbconn) {
        // Return null or handle error gracefully depending on usage
        return null;
    }
    return $dbconn;
}
?>