<?php

declare(strict_types=1);

/*
  Работа с рецептами: чтение, проверка и сохранение.

  Здесь нет ни HTML, ни JSON: функции возвращают обычные массивы PHP.
  api/recipes.php превращает их в JSON, catalog.php — в HTML.
*/

const DIFFICULTY_LABELS = [
    'easy' => 'Легко',
    'medium' => 'Средне',
    'hard' => 'Сложно',
];

const RECIPE_TITLE_MIN = 3;
const RECIPE_TITLE_MAX = 80;
const RECIPE_TIME_MIN = 5;
const RECIPE_TIME_MAX = 600;
const RECIPE_TIME_STEP = 5;
const INGREDIENTS_MIN = 2;
const INGREDIENTS_MAX = 30;
const INGREDIENT_MAX_LENGTH = 100;

function find_categories(PDO $pdo): array
{
    // Пользовательских данных в запросе нет, поэтому prepare() не нужен.
    // Псевдонимы AS id и AS text сохраняют прежний формат data/categories.json,
    // поэтому JavaScript на странице не пришлось переписывать.
    return $pdo
        ->query('SELECT slug AS id, title, description AS text, icon FROM categories ORDER BY sort_order, id')
        ->fetchAll();
}

// Строка из базы → рецепт для ответа: ингредиенты из текста становятся массивом.
function format_recipe(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'category' => $row['category'],
        'categoryTitle' => $row['category_title'],
        'time' => (int) $row['cooking_time'],
        'difficulty' => $row['difficulty'],
        'ingredients' => explode("\n", $row['ingredients']),
        'createdAt' => $row['created_at'],
    ];
}

const RECIPE_SELECT = '
    SELECT r.id, r.title, r.cooking_time, r.difficulty, r.ingredients, r.created_at,
           c.slug AS category, c.title AS category_title
    FROM recipes AS r
    JOIN categories AS c ON c.id = r.category_id
';

// Последние рецепты; если передан slug категории — только из нее.
function find_recipes(PDO $pdo, ?string $categorySlug = null, int $limit = 20): array
{
    $sql = RECIPE_SELECT;
    $params = [];

    if ($categorySlug !== null) {
        // :category — именованный параметр. Значение передается отдельно от текста SQL,
        // поэтому строка пользователя не может изменить сам запрос.
        $sql .= ' WHERE c.slug = :category';
        $params['category'] = $categorySlug;
    }

    // LIMIT подставляем числом из кода, а не из запроса пользователя.
    $sql .= ' ORDER BY r.created_at DESC, r.id DESC LIMIT ' . $limit;

    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    return array_map('format_recipe', $statement->fetchAll());
}

function find_recipe(PDO $pdo, int $id): ?array
{
    $statement = $pdo->prepare(RECIPE_SELECT . ' WHERE r.id = :id');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();

    return $row === false ? null : format_recipe($row);
}

function find_category_id(PDO $pdo, string $slug): ?int
{
    $statement = $pdo->prepare('SELECT id FROM categories WHERE slug = :slug');
    $statement->execute(['slug' => $slug]);
    $id = $statement->fetchColumn();

    return $id === false ? null : (int) $id;
}

/*
  Проверка данных рецепта на сервере.

  Правила те же, что в форме, но сервер не доверяет браузеру: запрос можно отправить
  из Console, curl или Postman в обход любой проверки на странице.
  Возвращает [чистые данные, ошибки по полям]. Если ошибок нет, второй элемент — пустой массив.
*/
function validate_recipe(PDO $pdo, array $input): array
{
    $errors = [];
    $recipe = [];

    // Название: строка, без пробелов по краям, длина в символах (mb_strlen, а не strlen: кириллица — 2 байта).
    $title = $input['title'] ?? null;

    if (!is_string($title) || trim($title) === '') {
        $errors['title'] = 'Заполните название';
    } else {
        $title = trim($title);
        $length = mb_strlen($title);

        if ($length < RECIPE_TITLE_MIN || $length > RECIPE_TITLE_MAX) {
            $errors['title'] = sprintf('Название — от %d до %d символов', RECIPE_TITLE_MIN, RECIPE_TITLE_MAX);
        } else {
            $recipe['title'] = $title;
        }
    }

    // Категория: должна существовать в базе. Список категорий знает только сервер.
    $category = $input['category'] ?? null;
    $categoryId = is_string($category) ? find_category_id($pdo, $category) : null;

    if ($categoryId === null) {
        $errors['category'] = 'Выберите категорию из списка';
    } else {
        $recipe['category_id'] = $categoryId;
    }

    // Время: целое число в диапазоне и кратное шагу. Строка "30" или 30.5 не подходят.
    $time = $input['time'] ?? null;

    if (!is_int($time)) {
        $errors['time'] = 'Укажите время целым числом минут';
    } elseif ($time < RECIPE_TIME_MIN || $time > RECIPE_TIME_MAX || $time % RECIPE_TIME_STEP !== 0) {
        $errors['time'] = sprintf('От %d до %d минут, шаг %d', RECIPE_TIME_MIN, RECIPE_TIME_MAX, RECIPE_TIME_STEP);
    } else {
        $recipe['cooking_time'] = $time;
    }

    // Сложность: только одно из известных значений.
    $difficulty = $input['difficulty'] ?? null;

    if (!is_string($difficulty) || !array_key_exists($difficulty, DIFFICULTY_LABELS)) {
        $errors['difficulty'] = 'Выберите сложность';
    } else {
        $recipe['difficulty'] = $difficulty;
    }

    // Ингредиенты: массив строк; пустые строки отбрасываем, остальные проверяем по длине.
    $ingredients = $input['ingredients'] ?? null;

    if (!is_array($ingredients)) {
        $errors['ingredients'] = 'Добавьте ингредиенты';
    } else {
        $clean = [];

        foreach ($ingredients as $item) {
            if (is_string($item) && trim($item) !== '') {
                $clean[] = trim($item);
            }
        }

        $isTooLong = count(array_filter($clean, function (string $item): bool {
            return mb_strlen($item) > INGREDIENT_MAX_LENGTH;
        })) > 0;

        if (count($clean) < INGREDIENTS_MIN) {
            $errors['ingredients'] = sprintf('Нужно минимум два ингредиента, сейчас %d', count($clean));
        } elseif (count($clean) > INGREDIENTS_MAX) {
            $errors['ingredients'] = sprintf('Не больше %d ингредиентов', INGREDIENTS_MAX);
        } elseif ($isTooLong) {
            $errors['ingredients'] = sprintf('Каждый ингредиент — не длиннее %d символов', INGREDIENT_MAX_LENGTH);
        } else {
            // Перевод строки внутри ингредиента сломал бы хранение «по одному на строку».
            $recipe['ingredients'] = implode("\n", str_replace(["\r", "\n"], ' ', $clean));
        }
    }

    return [$recipe, $errors];
}

// Сохраняет проверенный рецепт и возвращает его id.
function insert_recipe(PDO $pdo, array $recipe): int
{
    $statement = $pdo->prepare(
        'INSERT INTO recipes (category_id, title, cooking_time, difficulty, ingredients)
         VALUES (:category_id, :title, :cooking_time, :difficulty, :ingredients)'
    );

    $statement->execute($recipe);

    return (int) $pdo->lastInsertId();
}
