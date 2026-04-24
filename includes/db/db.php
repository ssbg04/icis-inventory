<?php
// db.php
// $host = 'localhost';
// $db_name = 'icis'; // Change this to your database name
// $username = 'root'; // Change if your DB user is different
// $password = ''; // Change if your DB has a password
// $port = 3306;
require_once __DIR__ . "/../env_loader.php";
loadEnv(__DIR__ . "/../../.env");

var_dump([
    "DB_HOST" => getenv("DB_HOST"),
    "DB_PORT" => getenv("DB_PORT"),
    "DB_NAME" => getenv("DB_NAME"),
    "DB_USER" => getenv("DB_USER"),
    "DB_PASS" => getenv("DB_PASS"),
]);
exit;

$host = getenv("DB_HOST");
$port = getenv("DB_PORT");
$db_name = getenv("DB_NAME");
$username = getenv("DB_USER");
$password = getenv("DB_PASS");

try {
    $pdo = new PDO(
    "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4",
    $username,
    $password,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]
);
} catch(PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $e->getMessage()]));
}
?>