# API Recipes

Все адреса указаны относительно корня сайта. Ответы — JSON в UTF-8 (`Content-Type: application/json; charset=utf-8`).
При ошибке тело ответа — объект с полем `error`, а при ошибке проверки данных дополнительно `errors` по полям.

## GET `api/categories.php`

Список категорий из таблицы `categories`. Формат совпадает с прежним `data/categories.json`.

| Код | Когда | Тело |
| --- | --- | --- |
| 200 | всегда при доступной базе | массив категорий |
| 405 | метод не GET | `{"error": "..."}` и заголовок `Allow` |
| 500 | нет `config/config.php`, база недоступна, ошибка SQL | `{"error": "..."}` |

```json
[
  { "id": "simple", "title": "Простые блюда", "text": "Время приготовления таких блюд не более 1 часа", "icon": "assets/images/icon/menu.svg" }
]
```

## GET `api/recipes.php`

Последние 20 рецептов, новые первыми. Параметр `category` (slug категории) — только рецепты этой категории: `api/recipes.php?category=simple`.

```json
[
  {
    "id": 3,
    "title": "Сырники",
    "category": "kids",
    "categoryTitle": "Детское",
    "time": 25,
    "difficulty": "easy",
    "ingredients": ["Творог — 400 г", "Яйцо — 1 шт."],
    "createdAt": "2026-11-20 13:17:19"
  }
]
```

## GET `api/recipes.php?id=3`

Один рецепт (объект как выше) или `404 {"error": "Рецепт не найден"}`. Нечисловой `id` тоже дает 404.

## POST `api/recipes.php`

Создает рецепт. Тело — JSON-объект, заголовок `Content-Type: application/json`.

```json
{
  "title": "Сырники",
  "category": "kids",
  "time": 25,
  "difficulty": "easy",
  "ingredients": ["Творог — 400 г", "Яйцо — 1 шт."]
}
```

Правила сервера (те же, что в форме, но проверяются заново):

| Поле | Правило |
| --- | --- |
| `title` | строка, после `trim` от 3 до 80 символов |
| `category` | slug существующей категории |
| `time` | целое число от 5 до 600, кратное 5 (`"30"` строкой или `30.5` не принимаются) |
| `difficulty` | `easy`, `medium` или `hard` |
| `ingredients` | массив строк; пустые строки отбрасываются; осталось от 2 до 30, каждая не длиннее 100 символов |

| Код | Когда | Тело |
| --- | --- | --- |
| 201 | рецепт сохранен | сохраненный рецепт; заголовок `Location: recipes.php?id=N` |
| 400 | тело не является JSON-объектом | `{"error": "..."}` |
| 415 | `Content-Type` не `application/json` | `{"error": "..."}` |
| 422 | данные не прошли проверку | `{"error": "Проверьте данные рецепта", "errors": {"time": "От 5 до 600 минут, шаг 5"}}` |
| 500 | ошибка базы или PHP | `{"error": "Ошибка на сервере. Попробуйте позже"}`; при `debug: true` в `config/config.php` — еще поле `debug` |

## Как проверить без формы

Запрос из DevTools → Console на открытой странице проекта обходит проверку в браузере и показывает, что сервер проверяет данные сам:

```js
const response = await fetch('api/recipes.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '   ', category: 'nope', time: 7, difficulty: 'easy', ingredients: ['один'] }),
});
console.log(response.status, await response.json()); // 422 и ошибки по полям
```

## Что пока не реализовано

- Вход и регистрация: формы в окне «Войти» по-прежнему проверяются только в браузере и на сервер не отправляются. Пароли, хеширование и сессии — следующий этап.
- Загрузка фото рецепта на сервер.
- Изменение и удаление рецептов (`PUT`/`PATCH`/`DELETE`).
