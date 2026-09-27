<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

$body = requestBody();
$userId = requiredUserId($body);
$search = isset($body['search']) && is_string($body['search']) ? trim($body['search']) : '';
if (strlen($search) > 50) {
    respond(['error' => 'Field search must contain at most 50 characters'], 400);
}
$pattern = '%' . $search . '%';

$conn = db();
$stmt = $conn->prepare(
    'SELECT Name FROM Colors WHERE UserID = ? AND Name LIKE ? ORDER BY Name ASC'
);
$stmt->bind_param('is', $userId, $pattern);
$stmt->execute();
$result = $stmt->get_result();
$colors = [];
while ($row = $result->fetch_assoc()) {
    $colors[] = $row['Name'];
}

respond([
    'results' => $colors,
    'searchResults' => implode(', ', $colors),
    'error' => '',
]);

