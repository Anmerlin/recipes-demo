<?php

declare(strict_types=1);

/*
  GET api/categories.php → 200, JSON-массив категорий.

  Формат ответа совпадает с прежним data/categories.json,
  поэтому в scripts/script.js изменился только адрес CATEGORIES_URL.
*/

require __DIR__ . '/../server/json.php';
require __DIR__ . '/../server/recipes.php';

require_method(['GET']);

send_json(200, find_categories(db()));
