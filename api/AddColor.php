<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

$body = requestBody();
$userId = requiredUserId($body);
$color = requiredString($body, 'color');

$conn = db();
$stmt = $conn->prepare('INSERT INTO Colors (Name, UserID) VALUES (?, ?)');
try {
    $stmt->bind_param('si', $color, $userId);
    $stmt->execute();
} catch (mysqli_sql_exception $exception) {
    if ($exception->getCode() === 1452) {
        respond(['error' => 'User not found'], 404);
    }
    throw $exception;
}

respond(['error' => '']);

