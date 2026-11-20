<?php

declare(strict_types=1);

/*
  Общие правила JSON API.

  Любой ответ API — JSON с подходящим кодом статуса. Ошибки PHP не печатаются в ответ
  (иначе браузер получит HTML-предупреждение вместо JSON и response.json() упадет),
  а записываются в журнал ошибок PHP.
*/

require_once __DIR__ . '/db.php';

ini_set('display_errors', '0');
ini_set('log_errors', '1');

function send_json(int $status, $data): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // JSON_UNESCAPED_UNICODE — кириллица как есть, а не Ты...
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function send_error(int $status, string $message, array $errors = []): void
{
    $body = ['error' => $message];

    if ($errors !== []) {
        $body['errors'] = $errors;
    }

    send_json($status, $body);
}

// 405, если метод запроса не поддерживается этим адресом.
function require_method(array $allowed): string
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        send_error(405, 'Метод ' . $method . ' не поддерживается');
    }

    return $method;
}

// Тело запроса в формате JSON → массив PHP. Для fetch с JSON $_POST остается пустым.
function read_json_body(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== 0) {
        send_error(415, 'Ожидается тело запроса в формате JSON (Content-Type: application/json)');
    }

    $data = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($data)) {
        send_error(400, 'Тело запроса — не JSON-объект');
    }

    return $data;
}

// Последняя линия: любое необработанное исключение (нет config.php, база недоступна, ошибка SQL)
// превращается в ответ 500. Подробности — в журнал, пользователю — короткое сообщение.
set_exception_handler(function (Throwable $error): void {
    error_log('[recipes api] ' . $error->getMessage());

    $debug = false;

    try {
        $debug = (bool) (load_config()['debug'] ?? false);
    } catch (Throwable $configError) {
        // Без настроек отладочные подробности не показываем.
    }

    $body = ['error' => 'Ошибка на сервере. Попробуйте позже'];

    if ($debug) {
        $body['debug'] = $error->getMessage();
    }

    send_json(500, $body);
});
