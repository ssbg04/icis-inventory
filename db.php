<?php
// db.php
$host = 'localhost';
$db_name = 'icis'; // Change this to your database name
$username = 'root'; // Change if your DB user is different
$password = ''; // Change if your DB has a password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]));
}
?>