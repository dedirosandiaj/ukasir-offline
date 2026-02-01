<?php
header('Content-Type: text/plain');
echo "PHP Version: " . phpversion() . "\n";
echo "PHP Binary: " . PHP_BINARY . "\n";
echo "Loaded INI: " . php_ini_loaded_file() . "\n";
echo "PgSQL Extension: " . (extension_loaded('pgsql') ? 'INSTALLED' : 'MISSING') . "\n";
echo "PDO PgSQL Extension: " . (extension_loaded('pdo_pgsql') ? 'INSTALLED' : 'MISSING') . "\n";
?>