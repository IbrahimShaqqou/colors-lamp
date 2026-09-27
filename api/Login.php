<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

$body = requestBody();
$login = requiredString($body, 'login');
$password = requiredString($body, 'password', 255);
$passwordHash = md5($password);

$conn = db();
$stmt = $conn->prepare(
    'SELECT ID, FirstName, LastName FROM Users WHERE Login = ? AND Password = ? LIMIT 1'
);
$stmt->bind_param('ss', $login, $passwordHash);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    respond(['id' => 0, 'firstName' => '', 'lastName' => '', 'error' => 'No Records Found']);
}

respond([
    'id' => (int) $user['ID'],
    'firstName' => $user['FirstName'],
    'lastName' => $user['LastName'],
    'error' => '',
]);

