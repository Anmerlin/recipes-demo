-- Recipes: начальные данные. Импортировать после schema.sql.

-- Кодировка соединения на время импорта. Без этой строки клиент может прочитать файл
-- как latin1, и кириллица сохранится «кракозябрами» (ÐŸÑ€Ð¾...).
SET NAMES utf8mb4;

USE recipes_demo;

-- Те же четыре категории, что были в data/categories.json.
INSERT INTO categories (slug, title, description, icon, sort_order) VALUES
  ('simple', 'Простые блюда', 'Время приготовления таких блюд не более 1 часа', 'assets/images/icon/menu.svg', 1),
  ('kids', 'Детское', 'Самые полезные блюда, которые можно детям любого возраста', 'assets/images/icon/cook.svg', 2),
  ('chef', 'От шеф-поваров', 'Требуют умения, времени и терпения, зато как в ресторане', 'assets/images/icon/chef.svg', 3),
  ('holiday', 'На Праздник', 'Чем удивить гостей, чтобы все были сыты за праздничным столом', 'assets/images/icon/fire.svg', 4);

-- Два рецепта для проверки чтения. category_id берем подзапросом по slug,
-- чтобы не зависеть от того, какие id база выдала категориям.
INSERT INTO recipes (category_id, title, cooking_time, difficulty, ingredients) VALUES
  ((SELECT id FROM categories WHERE slug = 'simple'), 'Тыквенный супчик на кокосовом молоке', 40, 'easy',
    'Тыква — 500 г\nКокосовое молоко — 400 мл\nЛук — 1 шт.\nИмбирь — 10 г'),
  ((SELECT id FROM categories WHERE slug = 'holiday'), 'Запеченная курица с яблоками', 90, 'medium',
    'Курица — 1,5 кг\nЯблоки — 3 шт.\nЧеснок — 4 зубчика\nРозмарин — 2 веточки');
