<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    respond(['error' => 'Method not allowed']);
}

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function requestBody(): array
{
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    if (!is_array($body)) {
        respond(['error' => 'Invalid JSON body'], 400);
    }
    return $body;
}

function requiredString(array $body, string $key, int $maxLength = 50): string
{
    if (!isset($body[$key]) || !is_string($body[$key])) {
        respond(['error' => "Missing or invalid field: {$key}"], 400);
    }
    $value = trim($body[$key]);
    if ($value === '' || strlen($value) > $maxLength) {
        respond(['error' => "Field {$key} must contain 1-{$maxLength} characters"], 400);
    }
    return $value;
}

function requiredUserId(array $body): int
{
    $value = filter_var($body['userId'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);
    if ($value === false) {
        respond(['error' => 'Missing or invalid field: userId'], 400);
    }
    return $value;
}

function db(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    try {
        $conn = new mysqli(
            getenv('COLORS_DB_HOST') ?: 'localhost',
            getenv('COLORS_DB_USER') ?: 'colors_api',
            getenv('COLORS_DB_PASSWORD') ?: '',
            getenv('COLORS_DB_NAME') ?: 'COP4331'
        );
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (mysqli_sql_exception $exception) {
        error_log($exception->getMessage());
        respond(['error' => 'Database connection failed'], 500);
    }
}

