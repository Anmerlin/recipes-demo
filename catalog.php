<?php

declare(strict_types=1);

/*
  Каталог рецептов: та же база, но HTML собирает сервер.

  Это второй способ показать данные из БД (обзорно). На главной странице данные
  приходят в JavaScript через API в формате JSON, а здесь PHP сразу печатает готовый HTML,
  и страница работает без JavaScript. Фильтр — обычная форма с method="get".
*/

require __DIR__ . '/server/db.php';
require __DIR__ . '/server/recipes.php';

// Любой текст из базы или из запроса выводим только через e():
// htmlspecialchars превращает < > " ' & в безопасные сущности (защита от XSS).
function e(string $text): string
{
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

$selected = isset($_GET['category']) && is_string($_GET['category']) ? $_GET['category'] : '';
$categories = [];
$recipes = [];
$loadError = false;

try {
    $pdo = db();
    $categories = find_categories($pdo);
    $recipes = find_recipes($pdo, $selected === '' ? null : $selected);
} catch (Throwable $error) {
    error_log('[recipes catalog] ' . $error->getMessage());
    $loadError = true;
    http_response_code(500);
}
?>
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Каталог рецептов — Recipes</title>
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body class="catalog-page">
    <main class="catalog">
      <div class="container catalog__inner">
        <p class="catalog__back"><a href="index.html">← На главную</a></p>
        <h1 class="section-title catalog__title">Каталог рецептов</h1>
        <p class="section-lead catalog__lead">Страницу собирает PHP на сервере: данные из базы попадают в HTML до того, как браузер его получит.</p>

        <form class="catalog__filter" action="catalog.php" method="get">
          <label class="form__label" for="catalog-category">Категория</label>
          <select class="form__input form__select" id="catalog-category" name="category">
            <option value="">Все категории</option>
            <?php foreach ($categories as $category): ?>
              <option value="<?= e($category['id']) ?>"<?= $category['id'] === $selected ? ' selected' : '' ?>><?= e($category['title']) ?></option>
            <?php endforeach; ?>
          </select>
          <button class="button" type="submit">Показать</button>
        </form>

        <?php if ($loadError): ?>
          <p class="catalog__status" role="alert">Не удалось загрузить рецепты. Попробуйте обновить страницу позже.</p>
        <?php elseif ($recipes === []): ?>
          <p class="catalog__status">В этой категории пока нет рецептов.</p>
        <?php else: ?>
          <ul class="catalog__list">
            <?php foreach ($recipes as $recipe): ?>
              <li class="recipe-item">
                <article>
                  <h2 class="recipe-item__title"><?= e($recipe['title']) ?></h2>
                  <p class="recipe-item__meta">
                    <?= e($recipe['categoryTitle']) ?> · <?= $recipe['time'] ?> мин · <?= e(DIFFICULTY_LABELS[$recipe['difficulty']]) ?>
                  </p>
                  <ul class="recipe-item__ingredients">
                    <?php foreach ($recipe['ingredients'] as $ingredient): ?>
                      <li><?= e($ingredient) ?></li>
                    <?php endforeach; ?>
                  </ul>
                </article>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>
    </main>
  </body>
</html>
