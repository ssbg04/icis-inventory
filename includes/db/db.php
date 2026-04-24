<?php
// db.php
// $host = 'localhost';
// $db_name = 'icis'; // Change this to your database name
// $username = 'root'; // Change if your DB user is different
// $password = ''; // Change if your DB has a password
// $port = 3306;
$host = 'icis-inventory-crischarlesgarcia345-12a1.c.aivencloud.com';
$db_name = 'defaultdb'; // Change this to your database name
$username = 'webapp'; // Change if your DB user is different
$password = 'AVNS_D5rqxPUXzPwYy2307kd'; // Change if your DB has a password
$port = 22378;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]));
}
?>