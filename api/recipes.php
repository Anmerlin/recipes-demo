<?php

declare(strict_types=1);

/*
  Рецепты.

  GET  api/recipes.php                    → 200, последние рецепты
  GET  api/recipes.php?category=simple    → 200, рецепты одной категории
  GET  api/recipes.php?id=5               → 200, один рецепт или 404
  POST api/recipes.php (JSON-объект)      → 201 и сохраненный рецепт
                                          → 422 и ошибки по полям, если данные не прошли проверку

  Описание всех адресов API — в docs/api.md.
*/

require __DIR__ . '/../server/json.php';
require __DIR__ . '/../server/recipes.php';

$method = require_method(['GET', 'POST']);
$pdo = db();

if ($method === 'GET' && isset($_GET['id'])) {
    // filter_var вернет false для «abc», «1.5» или «-3» — такие id не ищем.
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $found = $id === false ? null : find_recipe($pdo, $id);

    if ($found === null) {
        send_error(404, 'Рецепт не найден');
    }

    send_json(200, $found);
}

if ($method === 'GET') {
    // $_GET — параметры из строки запроса (?category=simple). Значение может быть любым:
    // проверяем тип, а в SQL передаем только через подготовленный запрос.
    $category = $_GET['category'] ?? null;

    if ($category !== null && !is_string($category)) {
        send_error(400, 'Параметр category должен быть строкой');
    }

    send_json(200, find_recipes($pdo, $category === '' ? null : $category));
}

// POST: создание рецепта.
$input = read_json_body();
[$recipe, $errors] = validate_recipe($pdo, $input);

if ($errors !== []) {
    // 422 Unprocessable Content: запрос понятен, но данные не прошли проверку.
    send_error(422, 'Проверьте данные рецепта', $errors);
}

$id = insert_recipe($pdo, $recipe);

// 201 Created + Location: где теперь «живет» новая запись.
header('Location: recipes.php?id=' . $id);
send_json(201, find_recipe($pdo, $id));
