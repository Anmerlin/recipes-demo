<?php

declare(strict_types=1);

/*
  Подключение к базе данных через PDO.

  Функцию вызывают и API (api/*.php), и страница catalog.php.
  Соединение создается один раз за запрос и переиспользуется.
*/

function load_config(): array
{
    static $config = null;

    if ($config === null) {
        $path = __DIR__ . '/../config/config.php';

        if (!is_file($path)) {
            throw new RuntimeException('Нет файла config/config.php: скопируйте config/config.example.php и укажите свои настройки');
        }

        $config = require $path;
    }

    return $config;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $db = load_config()['db'];

        // DSN — «адрес» базы: драйвер, сервер, порт, имя базы и кодировка соединения.
        // utf8mb4 — полный UTF-8: кириллица и эмодзи сохраняются без «????».
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $db['host'],
            $db['port'],
            $db['name']
        );

        $pdo = new PDO($dsn, $db['user'], $db['password'], [
            // Ошибка SQL — исключение, а не тихий false, который легко не заметить.
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // Строки результата — ассоциативные массивы: ['title' => '...'].
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Настоящие подготовленные запросы: SQL и данные уходят на сервер БД раздельно.
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    return $pdo;
}
